var config = require('./config')
var alexaBase = require('mpr-alexa-base')
var intents = alexaBase.intents
var createLambdaHandler = alexaBase.createLambdaHandler

let handlers = Object.assign(
  intents.defaultBuiltIns(config),
  intents.builtInAudio(config),
  intents.askSong(config),
  intents.askShow(config),
  intents.playPodcast(config)
  // ... add any other custom intent handlers here ...
)

exports.handler = createLambdaHandler(config, handlers)
