var nock = require('nock')
// var songOfTheDayFx = require('../fixtures/songOfTheDay.json')
var virtualAlexa = require('../virtual-alexa')

describe('Play podcast intent', function () {
  test.skip('Returns show info', function(done) {
    var alexa = virtualAlexa()
    var httpMock = nock('https://feeds.publicradio.org')
      .get('/public_feeds/song-of-the-day/rss/rss.rss')
      .reply(200, songOfTheDayFx.body, songOfTheDayFx.headers)

    alexa.intend('AskShowIntent')
      .then((payload) => {
        var ssml = '<speak> You are listening to Current Music with Jade </speak>'
        expect(payload.response.outputSpeech.ssml).toEqual(ssml)
        httpMock.done()
        done()
      })
  })
})
