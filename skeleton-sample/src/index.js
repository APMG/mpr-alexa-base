import config from './config'
import mprAlexaBase from 'mpr-alexa-base'

mprAlexaBase.configure(config)
exports.handler = mprAlexaBase.createLambdaHandler()
