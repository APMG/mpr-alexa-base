var Alexa = require('alexa-sdk')
var isArray = require('lodash.isarray')
var intents = require('./intents')

const createLambdaHandler = function (config, handlers) {
  return function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback)
    alexa.appId = config.APP_ID
    if (isArray(handlers)) {
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
  intents
}
