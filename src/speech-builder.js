var get = require('lodash.get')

// This is an attempt to generalize the process of constructing speech
// output from a known API data structure. Definitely needs refinement,
// might be more trouble than it's worth

// The function accepts an array of APIMessageFragments and
// behaves more or less like array.join(), except
// that each value in the array defines its own
// custom `beforeText` and/or `afterText`
// type APIMessageFragment = {
//   key: string        // the location of the data point within the passed `sourceObj`
//   beforeText: string // text to put before the key value in the constructed message
//   afterText: string  // text to put after the key value in the constructed message
// }

exports.buildMessageFromSpec = function (sourceObj, msgSpec) {
  let result = ''

  for (var m = 0; m < msgSpec.length; m++) {
    let spec = msgSpec[m]
    let fragmentValue = get(sourceObj, spec.key)

    if (typeof fragmentValue !== 'undefined' && fragmentValue.length) {
      if (result.length) {
        result += ' ' + spec.beforeText + ' '
      }
      result += sourceObj[spec.key]

      if (spec.afterText && spec.afterText.length) {
        result += ' ' + spec.afterText
      }
    }
  }

  return result.trim()
}
