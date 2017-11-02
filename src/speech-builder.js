// This accepts an array of APIMessageFragments and
// behaves more or less like array.join(), except
// that each value in the array defines its own
// custom `delimiterText`
exports.buildMessageFromSpec = function (sourceObj, msgSpec) {
  let result = ''

  for (var m = 0; m < msgSpec.length; m++) {
    let spec = msgSpec[m]
    let fragmentValue = sourceObj[spec.key]

    if (typeof fragmentValue !== 'undefined' && fragmentValue.length) {
      if (result.length) {
        result += ' ' + spec.delimiterText + ' '
      }
      result += sourceObj[spec.key]
    }
  }

  return result.trim()
}
