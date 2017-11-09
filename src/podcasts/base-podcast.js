var podcaster = require('../../podcaster')

var config

module.exports = function (stationConfig) {
  config = stationConfig
  return {
    'LaunchRequest': function () {
      podcaster(this).resume()
    },
    'AMAZON.HelpIntent': function () {
      this.emit(':tell', 'You can use normal audio controls, say "Play Latest", or say "Switch to Live Stream" to go back to Live Stream mode')
    },
    'AskShowIntent': tellInfo.bind(this),
    'AskSongIntent': tellInfo.bind(this)
  }
}

function tellInfo () {
  var episode = podcaster(this).getCurrentEpisode()
  var podcast = podcaster(this).getCurrentPodcast()
  var station = config.STATION_NAME
  var msg = 'You are listening to ' +
    episode.title +
    ' from the ' +
    podcast.title +
    ' podcast, by ' +
    station

  this.emit(':tell', msg)
}
