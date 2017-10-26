import Alexa from 'alexa-sdk'
import * as intents from './intents'

const createLambdaHandler = function (config, handlers) {
  return function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback)
    alexa.appId = config.APP_ID
    alexa.registerHandlers(handlers)
    alexa.execute()
  }
}

export {
  createLambdaHandler,
  intents
}
