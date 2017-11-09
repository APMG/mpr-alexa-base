var podcaster = require('../src/podcaster')
var podcastFixture = require('./fixtures/podcast')

var mockEmit = jest.fn()
var mockReceivedOffset = 500

var mockResponse = {
  speak: jest.fn(function () { return this }),
  audioPlayerClearQueue: jest.fn(function () { return this }),
  audioPlayerPlay: jest.fn(function () { return this })
}

describe('Podcaster Test', function () {
  var handler

  beforeEach(function () {
    handler = getMockHandler()
  })

  it('resumes playing', function () {
    podcaster(handler).resume()
    expectPlayEpisodeAtIndex(handler, 0)
  })

  it('stops', function () {
    podcaster(handler).stop()
    expect(mockResponse.audioPlayerClearQueue).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith(':responseReady')
    let targetEp = episodeAtIndex(handler, 0)
    expect(targetEp.playtime).toEqual(mockReceivedOffset)
  })

  it('starts episode over', function () {
    podcaster(handler).startOver()
    let targetEp = episodeAtIndex(handler, 0)
    expectPlayEpisode(targetEp)
    expect(targetEp.playtime).toEqual(0)
  })

  it('plays serial podcast from start', function () {
    handler.attributes.podcasts.data[0].isSerial = true
    podcaster(handler).playPodcastFromStart()
    let firstEpIndex = handler.attributes.podcasts.data[0].episodes.length - 1
    expectPlayEpisodeAtIndex(handler, firstEpIndex)
  })

  it('plays the "next" episode for non-serial podcast', function () {
    handler.attributes.podcasts.data[0].isSerial = false
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/08/re-tros-at-mosp-here'
    podcaster(handler).next()
    expectPlayEpisodeAtIndex(handler, 1)
  })

  it('plays the "next" episode for serial podcasts', function () {
    handler.attributes.podcasts.data[0].isSerial = true
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/06/shout-out-louds-porcelain'
    podcaster(handler).next()
    expectPlayEpisodeAtIndex(handler, 1)
  })

  it('plays the "previous" episode for non-serial podcast', function () {
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/06/shout-out-louds-porcelain'
    podcaster(handler).previous()
    expectPlayEpisodeAtIndex(handler, 1)
  })

  it('plays the "previous" episode for serial podcast', function () {
    handler.attributes.podcasts.data[0].isSerial = true
    let targetEp = episodeAtIndex(handler, 1)
    podcaster(handler).next()
    expectPlayEpisode(targetEp)
  })

  it('turns loop mode on', function () {
    handler.attributes.podcasts.data[0].isLooping = false
    podcaster(handler).turnLoopModeOn()
    expect(handler.attributes.podcasts.data[0].isLooping).toEqual(true)
    expect(podcaster(handler).isLooping()).toEqual(true)
  })

  it('turns loop mode off', function () {
    handler.attributes.podcasts.data[0].isLooping = true
    podcaster(handler).turnLoopModeOff()
    expect(handler.attributes.podcasts.data[0].isLooping).toEqual(false)
    expect(podcaster(handler).isLooping()).toEqual(false)
  })

  it('reads isLooping as false even when undefined', function () {
    delete handler.attributes.podcasts.data[0].isLooping
    expect(podcaster(handler).isLooping()).toEqual(false)
  })

  it('enqueues the next episode for non-serial podcast', function () {
    handler.attributes.podcasts.data[0].isSerial = false
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/08/re-tros-at-mosp-here'
    podcaster(handler).enqueueNext()
    expectPlayEpisodeAtIndex(handler, 1, 'REPLACE_ENQUEUED')
  })

  it('enqueues the next episode for serial podcast', function () {
    handler.attributes.podcasts.data[0].isSerial = true
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/06/shout-out-louds-porcelain'
    podcaster(handler).enqueueNext()
    expectPlayEpisodeAtIndex(handler, 1, 'REPLACE_ENQUEUED')
  })

  it('repeats the current podcast if looping is on', function () {
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/08/re-tros-at-mosp-here'
    podcaster(handler).turnLoopModeOn()
    podcaster(handler).enqueueNext()
    expectPlayEpisodeAtIndex(handler, 0, 'REPLACE_ENQUEUED')
  })

  it('plays the latest episode', function () {
    podcaster(handler).playLatest()
    expectPlayEpisodeAtIndex(handler, 0)
  })
})

function episodeAtIndex (handler, index) {
  return handler.attributes.podcasts.data[0].episodes[index]
}

function expectPlayEpisodeAtIndex (handler, index, playBehavior) {
  let episode = episodeAtIndex(handler, index)
  expectPlayEpisode(episode, playBehavior)
}

function expectPlayEpisode (episode, behavior) {
  let expectedMsg = 'Now playing ' + episode.title + ' from ' + podcastFixture.title
  expect(mockResponse.speak).toHaveBeenCalledWith(expectedMsg)
  expect(mockResponse.audioPlayerPlay).toHaveBeenCalledWith(
    behavior || 'REPLACE_ALL',
    episode.enclosure.url,
    '1',
    null,
    episode.playtime
  )
  expect(mockEmit).toHaveBeenCalledWith(':responseReady')
}

function getMockHandler (override) {
  var mockHandler = {
    attributes: {
      podcasts: {
        currentPodcastIndex: 0,
        data: [
          podcastFixture
        ]
      }
    },
    response: mockResponse,
    event: {
      request: {
        offsetInMilliseconds: mockReceivedOffset
      }
    },
    emit: mockEmit
  }
  return Object.assign({}, mockHandler, override)
}
