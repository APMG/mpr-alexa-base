var got = require('got')
var parsePodcast = require('node-podcast-parser')
var directives = require('../../directives')
var url = 'https://feeds.publicradio.org/public_feeds/song-of-the-day/rss/rss.rss'

got(url).then(
  function (res) {
    parsePodcast(res.body, function (err, data) {
      console.log(data, data.episodes[0].enclosure)
      // var episode = data.episodes[0]
      // directives.addPlayDirective(this, episode)
    })
  }
)

exports.default = function (config) {
  return {
    'SongOfTheDayIntent': function () {
      var url = 'https://feeds.publicradio.org/public_feeds/song-of-the-day/rss/rss.rss'
      got(url).then(
        function (res) {
          parsePodcast(res.body, function (err, data) {
            var episode = data.episodes[0]
            directives.addPlayDirective(this, episode.enclosure.url)
          })
        }
      )
    }
  }
}
