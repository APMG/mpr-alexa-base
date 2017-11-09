var podcaster = require('../../podcaster')
var cannotShuffleText = "Sorry, I can't shuffle a podcast"

module.exports = function () {
  return {
    'AMAZON.ResumeIntent': function () { podcaster(this).resume() },
    'AMAZON.PauseIntent': function () { podcaster(this).stop() },
    'AMAZON.StopIntent': function () { podcaster(this).stop() },
    'AMAZON.NextIntent': function () { podcaster(this).next() },
    'AMAZON.PreviousIntent': function () { podcaster(this).previous() },
    'AMAZON.LoopOnIntent': function () { podcaster(this).turnLoopModeOn() },
    'AMAZON.LoopOffIntent': function () { podcaster(this).turnLoopModeOff() },
    'AMAZON.ShuffleOnIntent': function () { this.emit(':tell', cannotShuffleText) },
    'AMAZON.ShuffleOffIntent': function () { this.emit(':tell', cannotShuffleText) },
    'AMAZON.StartOverIntent': function () { podcaster(this).startOver() },
    'PlaybackNearlyFinished': function () { podcaster(this).enqueueNext() }
  }
}
