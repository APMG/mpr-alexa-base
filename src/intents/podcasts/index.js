var Alexa = require('alexa-sdk')
var states = require('../../states')

var handlers = {
  songOfTheDay: require('./song-of-the-day').default
}

exports.default = Alexa.CreateStateHandler(states.PODCAST, handlers)
