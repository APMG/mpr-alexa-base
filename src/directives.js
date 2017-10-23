export function addPlayDirective (context, streamUrl) {
  context.response.audioPlayerPlay(
    'REPLACE_ALL', // replace the entire queue with the new url
    streamUrl,
    '1', // this is the track number. We are streaming live so it's only ever one track
    null, // this would be the anticipated "next" track, if there were one
    0 // where in the track to begin playing from, in milliseconds
  )
}

export function stop (context) {
  context.response.audioPlayerClearQueue('CLEAR_ALL')
  context.emit(':responseReady')
}

export function say (context, message) {
  context.response.speak(message)
  context.emit(':responseReady', message)
}
