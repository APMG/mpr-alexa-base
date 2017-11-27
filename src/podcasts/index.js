var Alexa = require('alexa-sdk')
var basePodcastAudioHandlers = require('./base-podcast-audio-intents')
var basePodcastHandler = require('./base-podcast')

module.exports = function (config, customHandlers) {
  return Object.assign(
    {},
    basePodcastAudioHandlers(config),
    basePodcastHandler(config),
    customHandlers
  )
}
