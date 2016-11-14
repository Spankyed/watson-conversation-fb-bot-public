import express from 'express'
import {getAppEnv, initEnv} from '../util/environmentWrapper'
import {webhookSubscribe, handleIncoming} from '../api/api'
import bodyParser from 'body-parser'
function startApp () {
  let app = express()

  // Init our environment variables (from CF or .env as appropriate)
  initEnv()

  // Parse POST bodies
  app.use(bodyParser.json())

  // Our routes and appropriate middleware
  app.get('/incoming', webhookSubscribe)
  app.post('/incoming', handleIncoming)

  // Start the server
  app.listen(getAppEnv().port, '0.0.0.0', function () {
    console.log('Server Started on ' + getAppEnv().port)
  })
}

export {startApp}
