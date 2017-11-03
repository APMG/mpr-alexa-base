// This accepts an array of APIMessageFragments and
// behaves more or less like array.join(), except
// that each value in the array defines its own
// custom `beforeText` and/or `afterText`
exports.buildMessageFromSpec = function (sourceObj, msgSpec) {
  let result = ''

  for (var m = 0; m < msgSpec.length; m++) {
    let spec = msgSpec[m]
    let fragmentValue = sourceObj[spec.key]

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
