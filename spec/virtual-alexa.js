var va = require('virtual-alexa')
var config = require('../skeleton-sample/src/config')

module.exports = function() {
  return va.VirtualAlexa.Builder()
    .handler("./spec/test-lambda-handler.handler")
    .intentSchemaFile("./speechAssets/IntentSchema.json")
    .sampleUtterancesFile("./speechAssets/SampleUtterances.txt")
    .applicationID(config.APP_ID)
    .create()
}
