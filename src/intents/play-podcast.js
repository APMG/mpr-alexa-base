var podcaster = require('../podcaster')
var config

// Play a podcast configured in the skill's
// `config.js` and interaction model

module.exports = function (stationConfig) {
  config = stationConfig

  return {
    'PlayPodcastIntent': function () {
      var complete = this.event.request.dialogState !== 'COMPLETED'

      if (!complete) {
        this.emit(':delegate')
      } else {
        playRequestedPodcast.call(this)
      }
    }
  }
}

function playRequestedPodcast () {
  var podcastName = this.event.request.intent.slots.Podcast.value
  var requestedPodcast = config.PODCASTS.find(function (podcast) {
    return podcast.name === podcastName
  })

  if (requestedPodcast && typeof requestedPodcast !== 'undefined') {
    var podcastManager = podcaster(this)
    podcastManager
      .setCurrentPodcast(requestedPodcast)
      .loadNewEpisodes()
      .then(playLatest(podcastManager))
  } else {
    this.emit(':tell', 'Sorry, I couldn\'t find a podcast called "' + podcastName + '".')
  }
}

function playLatest (podcastManager) {
  return function (success) {
    if (success) {
      podcastManager.playLatest()
    }
  }
}
