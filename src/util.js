exports.arrayToSentence = function (arr) {
  if (arr.length === 1) {
    return arr[0]
  }
  let last = arr.pop()
  return arr.join(', ') + ' and ' + last
}

exports.replacePhonemes = function (string, phonemeDictionary) {
  console.log('replacing phonemes for ' + string)
  console.log(phonemeDictionary)
  for (var phoneme in phonemeDictionary) {
    if (string.indexOf(phoneme) !== -1) {
      console.log(phoneme)
      console.log(phonemeDictionary[phoneme])
      string = string.replace(
        phoneme,
        "<phoneme alphabet='ipa' " +
          "ph='" + phonemeDictionary[phoneme] + "'>" +
          phoneme +
        '</phoneme>'
      )
    }
  }
  console.log(string)
  return string
}
