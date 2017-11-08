var podcaster = require('../src/intents/podcaster')
var podcastFixture = require('./fixtures/podcast')

var mockEmit = jest.fn()
var mockReceivedOffset = 500

var mockResponse = {
  speak: jest.fn(function () { return this }),
  audioPlayerClearQueue: jest.fn(function () { return this }),
  audioPlayerPlay: jest.fn(function () { return this })
}

var mockHandler = {
  attributes: {
    podcast: {
      isSerial: false,
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

describe('Podcaster Test', function () {
  it('resumes playing', function () {
    let handler = getMockHandler()
    podcaster(handler).resume()
    expect(mockResponse.speak).toHaveBeenCalled()
    let targetEp = handler.attributes.podcast.data[0].episodes[0]
    expect(mockResponse.audioPlayerPlay).toHaveBeenCalledWith(
      'REPLACE_ALL',
      targetEp.enclosure.url,
      '1',
      null,
      targetEp.playtime
    )
  })
  it('stops', function () {
    let handler = getMockHandler()
    podcaster(handler).stop()
    expect(mockResponse.audioPlayerClearQueue).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith(':responseReady')
    let targetEp = handler.attributes.podcast.data[0].episodes[0]
    expect(targetEp.playtime).toEqual(mockReceivedOffset)
  })
})

function getMockHandler (override) {
  return Object.assign(mockHandler, override)
}
