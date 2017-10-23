import get from 'lodash.get'
import client from '../api-client'
import { replacePhonemes, arrayToSentence } from '../util'

let config

export default function (stationConfig, handler, error) {
  config = stationConfig
  return {
    'AskShowIntent': function () {
      return client(config.NOW_PLAYING_URL)
        .get('/schedule')
        .then(
          handler || defaultHandler(this),
          error || defaultError(this)
        )
    }
  }
}

function defaultHandler (context) {
  return function (response) {
    let schedule = get(response, 'data.data.schedule', null)
    let program = schedule && schedule.length ? schedule[0] : null

    if (!program || !(program.people || program.shows)) {
      context.emit(':tell', config.SPOKEN_CANNOT_FIND)
    }

    let msg = buildMessage(program)
    context.emit(
      ':tellWithCard',
      'You are listening to ' + (msg || config.STATION_NAME),
      'Now Playing',
      msg
    )
  }
}

function defaultError (context) {
  return function (error) {
    context.emit(':tell', config.SPOKEN_ERROR)
  }
}

function buildMessage (program) {
  let hosts = handlePhonemes(program.people)
  let show = program.shows[0]
  let msg = ''

  if (show.name !== config.DEFAULT_SHOW_NAME) {
    msg += show.name
  }
  if (hosts) {
    // if the show name is in the message, add "with" to it
    msg += msg.length ? ' with ' : ''
    // otherwise we just return the host name(s)
    msg += arrayToSentence(hosts)
  }

  return msg
}

function handlePhonemes (people, config) {
  // get a list of names and format it like a sentence
  let names = people.map(function (person) { return person.name })
  names = arrayToSentence(names)

  // if no hosts are configured with phonetic
  // pronunciations (meaning Alexa pronounces
  // them corretctly by default), just return
  // the names as they are
  if (!config.HOST_PHONEMES) {
    return names
  }

  // otherwise, replace any instances of phonemes
  // with the configured phonetic values
  return replacePhonemes(names, config.HOST_PHONEMES)
}
