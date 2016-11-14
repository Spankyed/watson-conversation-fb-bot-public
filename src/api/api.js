import * as logging from '../util/logging.js'
import {sendMessageToUser} from '../util/facebookSend'
import {toConversation} from '../util/conversation'

const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN

// Middleware to handle webhook subscription requests
let webhookSubscribe = function (req, res, next) {
  logging.entry('api/api.js#webhookSubscribe', 'TESTID')
  // Handle webhook challenge
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === WEBHOOK_TOKEN) {
    res.status(200).send(req.query['hub.challenge'])
    logging.exit('api/api.js#webhookSubscribe', 'TESTID')
    return
  } else {
    logging.exit('api/api.js#webhookSubscribe', 'TESTID')
    res.status(500).send('Error validating webhook token')
    return
  }
}

// Middleware to handle incoming messages from facebook
let handleIncoming = async function (req, res, next) {
  // Handle an incoming message
  try {
    // Just be safe around the arrays. Most likely always length 1
    let entries = req.body.entry

    // Most likely always length 1
    for (let entry of entries) {
      let messages = entry.messaging

      // Most likely always length 1
      for (let message of messages) {
        let rid = message.sender.id
        // Handle the incoming request
        logging.new('api/api.js#handleIncoming', rid)
        logging.entry('api/api.js#handleIncoming', rid)
        logging.content('api/api.js#handleIncoming', rid, message, 'MESSAGE')

        // Await the response using async
        let output = await toConversation(message.message.text, rid)
        if (!sendMessageToUser(output.text, rid, output.attachment)) {
          logging.reportError('MESSAGES FAILED TO SEND', rid)
          res.status(199).send('SOME MESSAGES FAILED TO SEND')
        } else {
          logging.exit('api/api.js#handleIncoming', rid)
          logging.done('api/api.js#handleIncoming', rid)
          res.status(200).send('OK')
        }
      }
    }
  } catch (e) {
    logging.reportError(e, 'BAD_STRUCTURE')
  }
}

export {webhookSubscribe, handleIncoming}
