var get = require('lodash.get')
var got = require('got')
var speechBuilder = require('../speech-builder')

var config

exports.default = function (stationConfig, handler, error) {
  config = stationConfig

  return {
    'AskSongIntent': function () {
      return got(config.NOW_PLAYING_URL + '/playlist')
        .then(
          function handler (response) {
            let body = JSON.parse(response.body)
            let songs = get(body, 'data.songs', null)

            if (!songs || !songs.length || !songs[0]) {
              this.emit(':tell', config.SPOKEN_CANNOT_FIND)
              return
            }

            const messageSpec = [
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
            let songDesc = speechBuilder.buildMessageFromSpec(songs[0], messageSpec)

            this.emit(
              ':tellWithCard',
              'Now playing ' + songDesc,
              'Now Playing',
              songDesc
            )
          },
          error || defaultError().bind(this)
        )
    }
  }
}

function defaultError () {
  return function (error) {
    this.emit(':tell', config.SPOKEN_ERROR)
  }
}
