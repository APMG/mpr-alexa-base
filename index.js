import Alexa from 'alexa-sdk'
import axios from 'axios'
import get from 'lodash.get'

var config

function setConfig(newConfig) {
  config = newConfig
}

function getIntentHandlers(newConfig) {
  if (typeof newConfig !== 'undefined') {
    config = newConfig
  }

  // if (!config || typeof config === 'undefined') {
  //   throw new Error('You must pass in configuration values with `setConfig` or `getIntentHandlers` before getting intent handlers')
  // }

  return {
    'LaunchRequest': function () {
      addPlayDirective(this)
      this.response
        .cardRenderer(config.CARD_TITLE, config.CARD_CONTENT)
        .speak(config.SPOKEN_WELCOME || 'Welcome to ' + config.STATION_NAME)

      this.emit(':responseReady')
    },
    'AskSongIntent': function () {
      var self = this
      client().get('/playlist').then(
        function (response) {
          let songs = get(response, 'data.data.songs', null)
          let song = songs && songs.length ? songs[0] : null

          if (!song) {
            self.emit(':tell', config.SPOKEN_CANNOT_FIND)
          }
          let artist = song.artist || 'unknown'
          let title = song.title || 'unknown'
          let songDesc = title
            + " by "
            + artist
            + (song.album ? ' from the album ' + song.album : '')

          self.emit(
            ':tellWithCard',
            'Now playing ' + songDesc,
            'Now Playing',
            songDesc
          )
        },
        function(error) {
          self.emit(':tell', config.SPOKEN_ERROR)
        }
      )
    },
    'AskShowIntent': function () {
      var self = this
      client().get('/schedule').then(
        function (response) {
          let schedule = get(response, 'data.data.schedule', null)
          let program = schedule && schedule.length ? schedule[0] : null

          if (!program || !(program.people || program.shows)) {
            self.emit(':tell', config.SPOKEN_CANNOT_FIND)
          }

          let hosts = program.people.map(function (person) { return person.name })
          let show = program.shows[0]

          let msg = ''

          if (show.name !== config.DEFAULT_SHOW_NAME) {
            msg += show.name
          }
          if (hosts) {
            let hostSingPlur = hosts.length > 1 ? 'hosts' : 'host'
            // if the show name is in the message, add "with" to it
            msg += msg.length ? ' with ' : ''
            // otherwise we just return the host name(s)
            msg += hostSingPlur + ' ' + arrayToSentence(hosts)
          }

          self.emit(
            ':tellWithCard',
            'You are listening to ' + msg,
            'Now Playing',
            msg
          )
        },
        function(error) {
          self.emit(':tell', config.SPOKEN_ERROR)
        }
      )
    },
    'AMAZON.HelpIntent': function () {
      this.emit(':tell', config.SPOKEN_HELP)
    },
    'AMAZON.ResumeIntent': function () {
      addPlayDirective(this)
      this.emit(':responseReady')
    },
    'Unhandled': function () {
      this.emit(':tell', config.SPOKEN_UNHANDLED)
    },
    'AMAZON.CancelIntent': function () { stop(this) },
    'AMAZON.PauseIntent': function () { stop(this) },
    'AMAZON.StopIntent': function () { stop(this) },
    'AMAZON.NextIntent': function () { cannotDoForLiveStream(this) },
    'AMAZON.PreviousIntent': function () { cannotDoForLiveStream(this) },
    'AMAZON.LoopOnIntent': function () { cannotDoForLiveStream(this) },
    'AMAZON.LoopOffIntent': function () { cannotDoForLiveStream(this) },
    'AMAZON.ShuffleOnIntent': function () { cannotDoForLiveStream(this) },
    'AMAZON.ShuffleOffIntent': function () { cannotDoForLiveStream(this) },
    'AMAZON.StartOverIntent': function () { cannotDoForLiveStream(this) },
    'SessionEndedRequest': noop,
    'PlaybackNearlyFinished': noop,
  }
}

function cannotDoForLiveStream (context) {
  context.emit(':tell', config.SPOKEN_ILLOGICAL)
}

function stop (context) {
  context.response.audioPlayerClearQueue('CLEAR_ALL')
  context.emit(':responseReady')
}

function addPlayDirective (context) {
  context.response.audioPlayerPlay(
    'REPLACE_ALL', // replace the entire queue with the new url
    config.STREAM_URL,
    '1',  // this is the track number. We are streaming live so it's only ever one track
    null, // this would be the anticipated "next" track, if there were one
    0     // where in the track to begin playing from, in milliseconds
  )
}

function client () {
  return axios.create({
    baseURL: config.NOW_PLAYING_URL
  })
}

function arrayToSentence (arr) {
  if (arr.length === 1) {
    return arr[0]
  }
  let last = arr.pop()
  return arr.join(', ') + ' and ' + last
}

function noop () {}

export default {
  setConfig: setConfig,
  // So you can configure them if you want
  getIntentHandlers: getIntentHandlers,
  createLambdaHandler: function(handlers) {
    handlers = handlers || getIntentHandlers()
    return function (event, context, callback) {
      var alexa = Alexa.handler(event, context, callback)
      alexa.appId = config.APP_ID
      alexa.registerHandlers(handlers)
      alexa.execute()
    }
  }
}
