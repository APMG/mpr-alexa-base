// @flow
import get from 'lodash.get'
import isFunction from 'lodash.isfunction'
import client from '../api-client'
import { type APIMessageFragment, buildMessageFromSpec } from '../speech-builder'

let config
let context

export default function (stationConfig: any, handler: any, error: (response: any) => {}) {
  config = stationConfig
  context = this

  if (!isFunction(handler)) {
    handler = fromMessageSpec(handler || defaultMsgSpec)
  }

  return {
    'AskSongIntent': function () {
      return client(config.NOW_PLAYING_URL)
        .get('/schedule')
        .then(
          handler,
          error || defaultError
        )
    }
  }
}

// instead of having to provide a totally custom handler,
// users can supply a "msgSpec". This one works for The Current
const defaultMsgSpec : Array<APIMessageFragment> = [
  {
    key: 'title',
    delimiterText: 'the song'
  },
  {
    key: 'artist',
    delimiterText: 'by'
  },
  {
    key: 'album',
    delimiterText: 'from the album'
  }
]

function fromMessageSpec (messageSpec: Array<APIMessageFragment>) {
  return function (response): void {
    let songs = get(response, 'data.data.songs', null)

    if (!songs || !songs.length || !songs[0]) {
      context.emit(':tell', config.SPOKEN_CANNOT_FIND)
    }

    let songDesc = buildMessageFromSpec(songs[0], messageSpec)

    context.emit(
      ':tellWithCard',
      'Now playing ' + songDesc,
      'Now Playing',
      songDesc
    )
  }
}

function defaultError (error) {
  context.emit(':tell', config.SPOKEN_ERROR)
}
