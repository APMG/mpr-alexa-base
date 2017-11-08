var directives = require('../../directives')
var addPlayDirective = directives.addPlayDirective
var stop = directives.stop
var say = directives.say
var get = require('get')

var config

exports.default = function (stationConfig) {
  config = stationConfig
  return builtIns
}

const builtIns = {
  'AMAZON.ResumeIntent': resumeCurrentEpisode.bind(this),
  'AMAZON.PauseIntent': function () { stop(this) },
  'AMAZON.StopIntent': function () { stop(this) },
  'AMAZON.NextIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.PreviousIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.LoopOnIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.LoopOffIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.ShuffleOnIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.ShuffleOffIntent': function () { cannotDoForLiveStream(this) },
  'AMAZON.StartOverIntent': function () { cannotDoForLiveStream(this) },
  'PlaybackNearlyFinished': function () {}
}

function cannotDoForLiveStream (context) {
  say(context, config.SPOKEN_ILLOGICAL)
}

function resumeCurrentEpisode () {
  let currentPodcast = get(this, 'attributes.currentPod')
  let curPodLocation = 'attributes.podcasts.' + currentPodcast
  let currentEpisodeIndex = get(this, curPodLocation + '.currentEpisodeIndex')
  let currentEpisode = get(this, curPodLocation + '.episodes[' + currentEpisodeIndex + ']')

  if (!currentEpisode) {
    this.emit(':tell', 'I can\'t find the last episode you were listening to')
  }

  this.response.audioPlayerPlay(
    'REPLACE_ALL', // replace the entire queue with the new url
    currentEpisode.enclosure.url,
    '1', // this is the track number. We are streaming live so it's only ever one track
    null, // this would be the anticipated "next" track, if there were one
    0 // where in the track to begin playing from, in milliseconds
  )

  this.emit(':responseReady')
}
