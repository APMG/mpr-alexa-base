# MPR Alexa Base

Use this to rapidly generate lambda code for Alexa Skills that stream audio from MPR.

To start a new project, copy and paste the code from inside the `skeleton-sample` directory, run `yarn install` then update the `config.js` values to correspond to your streaming service.

To customize handlers, call `getIntentHandlers()` (with an optional config parameter), add / remove / alter handlers as necessary, then pass them in as a parameter to `createLambdaHandler`. E.g.,

```javascript
  import config from './config'
  import mprAlexaBase from 'mpr-alexa-base'

  let handlers = mprAlexaBase.getIntentHandlers(config)
  // ... do stuff with handlers ...
  exports.handler = mprAlexaBase.createLambdaHandler(handlers)
```

Then run `yarn run deploy` to generate a .zip file that is ready to be uploaded to Lambda.

You should be able to drop the `intents.json` file from the skeleton code right into the code editor on the interaction model builder.
