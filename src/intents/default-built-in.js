var directives = require('../directives')
var addPlayDirective = directives.addPlayDirective
var stop = directives.stop
var say = directives.say

var config

exports.default = function (stationConfig) {
  config = stationConfig
  return builtIns
}

const builtIns = {
  'AMAZON.HelpIntent': function () {
    this.emit(':tell', config.SPOKEN_HELP)
  },
  'AMAZON.ResumeIntent': function () {
    addPlayDirective(this, config.STREAM_URL)
    this.emit(':responseReady')
  },
  'Unhandled': function () {
    this.emit(':tell', config.SPOKEN_UNHANDLED)
  },
  'AMAZON.CancelIntent': function () { stop(this) },
  'AMAZON.PauseIntent': function () { stop(this) },
  'AMAZON.StopIntent': function () { stop(this) },
  'AMAZON.NextIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.PreviousIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.LoopOnIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.LoopOffIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.ShuffleOnIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.ShuffleOffIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.StartOverIntent': function () { cannotDoForLiveStream(this) },
  'SessionEndedRequest': function () {
    this.emit(':saveState', true)
  },
  'PlaybackNearlyFinished': noop
}

function cannotDoForLiveStream (context) {
  say(config.SPOKEN_ILLOGICAL)
}

function noop () {}
