var Alexa = require('alexa-sdk')
var intents = require('./intents')
var podcaster = require('./podcaster')
var states = require('./states')

const createLambdaHandler = function (config, handlers) {
  return function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback)
    alexa.appId = config.APP_ID
    if (Array.isArray(handlers)) {
      alexa.registerHandlers(...handlers)
    } else {
      alexa.registerHandlers(handlers)
    }
    if (config.DYNAMODB_TABLE_NAME) {
      alexa.dynamoDBTableName = config.DYNAMODB_TABLE_NAME
    }
    alexa.execute()
  }
}

export {
  createLambdaHandler,
  intents,
  podcaster,
  states
}
