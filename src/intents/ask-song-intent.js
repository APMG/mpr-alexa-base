// @flow
import get from 'lodash.get'
import isFunction from 'lodash.isfunction'
import got from 'got'
import { type APIMessageFragment, buildMessageFromSpec } from '../speech-builder'

let config

export default function (stationConfig: any, handler: any, error: (response: any) => {}) {
  config = stationConfig

  return {
    'AskSongIntent': function () {
      if (!isFunction(handler)) {
        handler = fromMessageSpec(handler || defaultMsgSpec).bind(this)
      }

      return got(config.NOW_PLAYING_URL + '/playlist')
        .then(
          handler,
          error || defaultError().bind(this)
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
    let body = JSON.parse(response.body)
    let songs = get(body, 'data.songs', null)

    if (!songs || !songs.length || !songs[0]) {
      this.emit(':tell', config.SPOKEN_CANNOT_FIND)
    }

    let songDesc = buildMessageFromSpec(songs[0], messageSpec)

    this.emit(
      ':tellWithCard',
      'Now playing ' + songDesc,
      'Now Playing',
      songDesc
    )
  }
}

function defaultError () {
  return function (error) {
    this.emit(':tell', config.SPOKEN_ERROR)
  }
}
