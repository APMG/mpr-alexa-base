var nock = require('nock')
var nowPlayingFx = require('../fixtures/nowPlaying.json')
var playlistFx = require('../fixtures/playlist.json')
var virtualAlexa = require('../virtual-alexa')

describe('Ask show intent', function () {
  it('Returns show info', function(done) {
    var alexa = virtualAlexa()
    var httpMock = nock('https://nowplaying.publicradio.org')
      .get('/your-station-slug/schedule')
      .reply(200, nowPlayingFx.body, nowPlayingFx.headers)

    alexa.intend('AskShowIntent')
      .then((payload) => {
        var ssml = '<speak> You are listening to Current Music with Jade </speak>'
        expect(payload.response.outputSpeech.ssml).toEqual(ssml)
        httpMock.done()
        done()
      })
  })
})
