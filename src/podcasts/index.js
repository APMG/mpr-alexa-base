var Alexa = require('alexa-sdk')
var states = require('../../states')
var basePodcastAudioHandlers = require('./base-podcast-audio-intents')
var basePodcastHandler = require('./base-podcast')

var handlers = Object.assign(
  {},
  basePodcastAudioHandlers(),
  basePodcastHandler()
)

exports.default = Alexa.CreateStateHandler(states.PODCAST, handlers)
