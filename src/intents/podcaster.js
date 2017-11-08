
module.exports = function (handler) {
  var currentPodcastIndex = handler['attributes']['podcast']['currentPodcastIndex']
  var currentPodcast = handler['attributes']['podcast']['data'][currentPodcastIndex]
  return {
    stop: function () {
      this._setCurrentTimeToRequestOffset()
      handler.response.audioPlayerClearQueue()
      handler.emit(':responseReady')
    },

    startOver: function () {
      this._updateEpisodePlaytime(0)
      var currentEpisode = this._getCurrentEpisode()
      this._play(currentEpisode)
    },

    playPodcastFromStart: function () {
      var episodes = currentPodcast.episodes
      var startEpisode = currentPodcast.isSerial
        ? episodes[0]
        : episodes[episodes.length - 1]

      this._play(startEpisode)
    },

    resume: function () {
      var currentEpisode = this._getCurrentEpisode()
      this._play(currentEpisode)
    },

    _play: function (episode) {
      handler.response
        .speak('Now playing ' + episode.title + ' from ' + currentPodcast.title)
        .audioPlayerPlay(
          'REPLACE_ALL', // replace the entire queue with the new url
          episode.enclosure.url,
          '1', // the track number... we don't receive episode numbers from the RSS feed so will keep it at one for now
          null, // this would be the anticipated "next" track, if there were one
          episode.playtime // where in the track to begin playing from, in milliseconds
        )
      handler.emit(':responseReady')
    },

    next: function () {
      var currentEpIndex = this._getCurrentEpisodeIndex()
      var nextEpIndex = currentPodcast.isSerial
        ? currentEpIndex + 1
        : currentEpIndex - 1

      var nextEpisode = currentPodcast.episodes[nextEpIndex]
      this._play(nextEpisode)
    },

    previous: function () {
      var currentEpIndex = this._getCurrentEpisodeIndex()
      var nextEpIndex = !currentPodcast.isSerial
        ? currentEpIndex + 1
        : currentEpIndex - 1

      var nextEpisode = currentPodcast.episodes[nextEpIndex]
      this._play(nextEpisode)
    },

    _getCurrentEpisodeIndex: function () {
      return currentPodcast.episodes.map(function (ep) {
        return ep.guid
      }).indexOf(currentPodcast.currentEpisodeGuid)
    },

    _getCurrentEpisode: function () {
      return currentPodcast.episodes.find(function (episode) {
        return episode.guid === currentPodcast.currentEpisodeGuid
      })
    },

    _setCurrentTimeToRequestOffset () {
      var newTime = handler.event.request.offsetInMilliseconds
      this._updateEpisodePlaytime(newTime)
    },

    _updateEpisodePlaytime (newTime) {
      var currentEpisode = this._getCurrentEpisode()
      currentEpisode.playtime = newTime
      currentPodcast.episodes[this._getCurrentEpisodeIndex()] = currentEpisode
      handler.attributes.podcast.data[currentPodcastIndex] = currentPodcast
    }
  }
}
