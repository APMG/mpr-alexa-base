// @flow
import { addPlayDirective } from '../directives'

export default function (stationConfig: any) {
  return {
    'LaunchRequest': function () {
      addPlayDirective(this, stationConfig.STREAM_URL)
      this.response
        .cardRenderer(stationConfig.CARD_TITLE, stationConfig.CARD_CONTENT)
        .speak(stationConfig.SPOKEN_WELCOME || 'Welcome to ' + stationConfig.STATION_NAME)

      this.emit(':responseReady')
    }
  }
}
