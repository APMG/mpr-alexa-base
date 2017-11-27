var Alexa = require('alexa-sdk')
var intents = require('./intents')
var podcaster = require('./podcaster')
var user = require('./user')

const createLambdaHandler = function (config, handlers) {
  return function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback)
    alexa.appId = config.APP_ID

    if (Array.isArray(handlers)) {
      // you can pass in an array of state-specific
      // handlers if you wish to use multiple states,
      // but this is not currently used anywhere
      alexa.registerHandlers.apply(alexa, handlers)
    } else {
      alexa.registerHandlers(handlers)
    }
    if (config.DYNAMODB_TABLE_NAME) {
      alexa.dynamoDBTableName = config.DYNAMODB_TABLE_NAME
    }
    alexa.execute()
  }
}

module.exports = {
  createLambdaHandler,
  intents,
  podcaster,
  user
}
