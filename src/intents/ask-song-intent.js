var get = require('lodash.get')
var got = require('got')
var speechBuilder = require('../speech-builder')

var config

// Ask the skill what song is currently on the live stream

// This is just a default for The Current
var messageSpec = [
  {
    beforeText: 'the song',
    key: 'title'
  },
  {
    beforeText: 'by',
    key: 'artist'
  },
  {
    beforeText: 'from the album',
    key: 'album'
  }
]

module.exports = function (stationConfig, customMessageSpec) {
  config = stationConfig
  if (customMessageSpec) {
    messageSpec = customMessageSpec
  }
  return {
    'AskSongIntent': function () {
      return got(config.NOW_PLAYING_URL + '/playlist')
        .then(
          handler.bind(this),
          defaultError.bind(this)
        )
    }
  }
}

const handler = function (response) {
  let body = JSON.parse(response.body)
  let songs = get(body, 'data.songs', null)

  if (!songs || !songs.length || !songs[0]) {
    this.emit(':tell', config.SPOKEN_CANNOT_FIND)
    return
  }

  let songDesc = speechBuilder.buildMessageFromSpec(songs[0], messageSpec)

  this.emit(
    ':tellWithCard',
    'Now playing ' + songDesc,
    'Now Playing',
    songDesc
  )
}

const defaultError = function (error) {
  this.emit(':tell', config.SPOKEN_ERROR)
}
