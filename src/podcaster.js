
module.exports = function (handler) {
  var currentPodcastIndex = handler['attributes']['podcasts']['currentPodcastIndex']
  var currentPodcast = handler['attributes']['podcasts']['data'][currentPodcastIndex]
  return {
    stop: function () {
      this._setCurrentTimeToRequestOffset()
      handler.response.audioPlayerClearQueue()
      handler.emit(':responseReady')
    },

    startOver: function () {
      this._updateEpisodePlaytime(0)
      var currentEpisode = this.getCurrentEpisode()
      this._play(currentEpisode)
    },

    playPodcastFromStart: function () {
      var episodes = currentPodcast.episodes
      var startEpisode = currentPodcast.isSerial
        ? episodes[episodes.length - 1]
        : episodes[0]

      this._play(startEpisode)
    },

    resume: function () {
      var currentEpisode = this.getCurrentEpisode()
      this._play(currentEpisode)
    },

    turnLoopModeOn: function () {
      handler.attributes.podcasts.data[currentPodcastIndex].isLooping = true
    },

    turnLoopModeOff: function () {
      handler.attributes.podcasts.data[currentPodcastIndex].isLooping = false
    },

    isLooping: function () {
      var result = handler.attributes.podcasts.data[currentPodcastIndex].isLooping
      return Boolean(result)
    },

    next: function () {
      var nextEpisode = this._getNextEpisode()
      this._play(nextEpisode)
    },

    previous: function () {
      var prevEpisode = this._getPreviousEpisode()
      this._play(prevEpisode)
    },

    playLatest: function () {
      this._play(currentPodcast.episodes[0])
    },

    enqueueNext: function () {
      var nextEp = this._getNextEpisode()
      this._play(nextEp, 'REPLACE_ENQUEUED')
    },

    getCurrentEpisode: function () {
      return currentPodcast.episodes.find(function (episode) {
        return episode.guid === currentPodcast.currentEpisodeGuid
      })
    },

    getCurrentPodcast: function () {
      return Object.assign({}, currentPodcast)
    },

    _play: function (episode, playBehavior) {
      this._updatePodcastCurrentEpisodeGuid(episode.guid)
      handler.response
        .speak('Now playing ' + episode.title + ' from ' + currentPodcast.title)
        .audioPlayerPlay(
          playBehavior || 'REPLACE_ALL', // replace all items in the queue with the current item
          episode.enclosure.url,
          '1', // the track number... we don't receive episode numbers from the RSS feed so will keep it at one for now
          null, // this would be the anticipated "next" track, if there were one
          episode.playtime // where in the track to begin playing from, in milliseconds
        )
      handler.emit(':responseReady')
    },

    _getCurrentEpisodeIndex: function () {
      return currentPodcast.episodes.map(function (ep) {
        return ep.guid
      }).indexOf(currentPodcast.currentEpisodeGuid)
    },

    _getPreviousEpisode: function () {
      var currentEpIndex = this._getCurrentEpisodeIndex()
      var nextEpIndex = currentPodcast.isSerial
        ? currentEpIndex + 1
        : currentEpIndex - 1

      return currentPodcast.episodes[nextEpIndex]
    },

    _getNextEpisode: function () {
      var currentEpIndex = this._getCurrentEpisodeIndex()

      if (currentPodcast.isLooping) {
        return currentPodcast.episodes[currentEpIndex]
      }

      var nextEpIndex = currentPodcast.isSerial
        ? currentEpIndex - 1
        : currentEpIndex + 1

      return currentPodcast.episodes[nextEpIndex]
    },

    _setCurrentTimeToRequestOffset () {
      var newTime = handler.event.request.offsetInMilliseconds
      this._updateEpisodePlaytime(newTime)
    },

    _updateEpisodePlaytime (newTime) {
      var currentEpisode = this.getCurrentEpisode()
      currentEpisode.playtime = newTime
      currentPodcast.episodes[this._getCurrentEpisodeIndex()] = currentEpisode
      handler.attributes.podcasts.data[currentPodcastIndex] = currentPodcast
    },

    _updatePodcastCurrentEpisodeGuid (newGuid) {
      handler.attributes.podcasts.data[currentPodcastIndex].currentEpisodeGuid = newGuid
    }
  }
}
