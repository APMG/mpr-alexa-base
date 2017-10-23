import Alexa from 'alexa-sdk'
import intents from './intents'

export default {
  intents: intents,
  createLambdaHandler: function (config, handlers) {
    return function (event, context, callback) {
      var alexa = Alexa.handler(event, context, callback)
      alexa.appId = config.APP_ID
      alexa.registerHandlers(handlers)
      alexa.execute()
    }
  }
}
