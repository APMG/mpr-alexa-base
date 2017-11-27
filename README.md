# MPR Alexa Base

This project serves as the base to Alexa skills created for the three main MPR stations: MPR News, Classical MPR, and The Current.

It provides standard handlers and audio handlers by default, as well as a few intents that are shared by at least two of the three stations.

## Sample Usage

```javascript
var config = require('./config')
var alexaBase = require('mpr-alexa-base')
var intents = alexaBase.intents
var createLambdaHandler = alexaBase.createLambdaHandler

let handlers = Object.assign(
  intents.defaultBuiltIns(config),
  intents.builtInAudio(config),
  intents.askSong(config),
  intents.askShow(config),
  intents.playPodcast(config)
  // ... add any other custom intent handlers here ...
)

exports.handler = createLambdaHandler(config, handlers)
```

## Quick Start
Do all the same things you would normally do to create a new Alexa Skill. Then:

1. Copy the contents of `skeleton-sample` into an empty directory and run `yarn install`

2. Copy and paste the contents of `skeleton-sample/intents.json` into the Alexa skill builder interaction model "Code" window.

## "Deployment"
From within a skill using this base, run the `yarn deploy` command (defined in the `skeleton-sample/package.json`) to generate a `alexa-bundle.zip` file that is ready to be uploaded to Lambda.
