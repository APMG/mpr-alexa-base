var base = require('../src/index')
var intents = base.intents
var config = require('../skeleton-sample/src/config')

var baseHandlers = Object.assign(
  intents.defaultBuiltIns(config),
  intents.builtInAudio(config),
  intents.askShow(config),
  intents.askSong(config)
)

exports.handler = base.createLambdaHandler(config, [baseHandlers])
