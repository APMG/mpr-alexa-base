var got = require('got')
var parsePodcast = require('node-podcast-parser')

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

    playOrResume: function () {
      var currentEpisode = this.getCurrentEpisode()
      if (!currentEpisode || typeof currentEpisode === 'undefined') {
        this.playPodcastFromStart()
      } else {
        this.resume()
      }
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
      if (!nextEpisode || typeof nextEpisode === 'undefined') {
        handler.emit(':tell', 'Sorry, there is no "next" episode to play')
        return
      }
      this._play(nextEpisode)
    },

    previous: function () {
      var prevEpisode = this._getPreviousEpisode()
      if (!prevEpisode || typeof prevEpisode === 'undefined') {
        handler.emit(':tell', 'Sorry, there is no "previous" episode to play')
        return
      }
      this._play(prevEpisode)
    },

    playLatest: function () {
      this._play(currentPodcast.episodes[0])
    },

    enqueueNext: function () {
      var nextEp = this._getNextEpisode()
      if (nextEp && typeof nextEp !== 'undefined') {
        this._play(nextEp, 'REPLACE_ENQUEUED')
      }
    },

    getCurrentEpisode: function () {
      return currentPodcast.episodes.find(function (episode) {
        return episode.guid === currentPodcast.currentEpisodeGuid
      })
    },

    getCurrentPodcast: function () {
      return Object.assign({}, currentPodcast)
    },

    setCurrentPodcast: function (feedUrl) {
      var newCurrentPodcastIndex = handler.attributes.podcasts.data.map(function (pod) {
        return pod.feedUrl
      }).indexOf(feedUrl)

      if (Number.isInteger(newCurrentPodcastIndex)) {
        handler.attributes.podcasts.currentPodcastIndex = newCurrentPodcastIndex
      } else {
        var newLength = handler.attributes.podcasts.push({feedUrl: feedUrl})
        handler.attributes.podcasts.currentPodcastIndex = newLength - 1
      }

      currentPodcastIndex = handler.attributes.podcasts.currentPodcastIndex
      currentPodcast = handler.attributes.podcasts.data[currentPodcastIndex]

      this._loadNewEpisodes()
    },

    _play: function (episode, playBehavior) {
      this._logPlay(episode)
      this._updatePodcastCurrentEpisodeGuid(episode.guid)
      handler.response
        .speak('Now playing ' + episode.title + ' from ' + currentPodcast.title)
        .audioPlayerPlay(
          playBehavior || 'REPLACE_ALL', // replace all items in the queue with the current item
          episode.enclosure.url,
          episode.guid, // a token that uniquely identifies the track
          this._getExpectedPreviousValue(playBehavior),
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
    },

    _loadNewEpisodes: function () {
      got(currentPodcast.feedUrl)
        .then(this._loadNewEpisodesSuccess.bind(this))
    },

    _loadNewEpisodesSuccess: function (res) {
      parsePodcast(res.body, function (err, newPod) {
        if (err) {
          handler.emit(':tell', 'Sorry, there was an error reading the podcast data')
          return
        }
        var currentEps = currentPodcast.episodes
        var loadedEps = newPod.episodes

        loadedEps
          // find episodes that aren't already in the episode array
          .filter(function (loadedEp) {
            return !currentEps.find(function (curEp) {
              return loadedEp.guid === curEp.guid
            })
          })
          // one by one add them to the beginning of the episode array
          .reverse()
          .map(function (newEp) {
            currentEps.unshift(newEp)
          })

        var loadedPodcast = Object.assign({}, currentPodcast, newPod)
        loadedPodcast.episodes = currentEps
        // store it on the handler
        handler.attributes.podcasts.data[currentPodcastIndex] = loadedPodcast
      })
    },

    _getExpectedPreviousValue: function (playBehavior) {
      if (playBehavior === 'REPLACE_ALL') {
        return null
      }

      var playRecord = handler.attributes.podcasts.playRecord

      if (!playRecord || typeof playRecord === 'undefined' || playRecord.length === 0) {
        return null
      }

      return playRecord[1] || null
    },

    _logPlay: function (episode) {
      // This is only a record of the order in which items have been
      // played so we are using the podcast index and episode guid
      // to create a unique identifying string that can also help
      // us locate the episode if for some reason we ever need to
      var playRecord = handler.attributes.podcasts.playRecord || []
      var newRecord = currentPodcastIndex + '|' + episode.guid
      // Add the ep to the record if it's not already the
      // most recently played item.
      if (playRecord[0] !== newRecord) {
        playRecord.unshift(newRecord)
      }

      handler.attributes.podcasts.playRecord = playRecord
    }
  }
}
