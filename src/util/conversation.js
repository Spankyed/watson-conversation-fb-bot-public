import request from 'request'
import logging from '../util/logging'
let contextMap = []

const WORKSPACE_ID = process.env.WORKSPACE_ID
const WORKSPACE_USER = process.env.WORKSPACE_USER
const WORKSPACE_PASS = process.env.WORKSPACE_PASS
const CONVERSATION_ENDPT = process.env.CONVERSATION_ENDPT
const CONVERSATION_VERSION = process.env.CONVERSATION_VERSION

// Await a response from conversation
async function toConversation (messageToSend, rid) {
  logging.entry('util/conversation.js#toConversation', rid)
  try {
    logging.exit('util/conversation.js#toConversation', rid)
    return await toConversationPromise(messageToSend, rid)
  } catch (e) {
    logging.reportError(e, rid)
    return false
  }
}

// Send a message (messageToSend) to Watson Conversation
// Resolves body.output
function toConversationPromise (messageToSend, rid) {
  // Send a context if appropriate
  let context = {}
  if (!contextMap[rid]) {
    context = {}
  } else {
    context = contextMap[rid]
    logging.content('util/conversation.js#toConversationPromise_CONTEXT', rid, context, 'CONTEXT')
  }
  return new Promise((resolve, reject) => {
    try {
      logging.entry('util/conversation.js#toConversationPromise', rid)
      // Make request to service
      request
        .post({
          url: CONVERSATION_ENDPT + '/workspaces/' + WORKSPACE_ID + '/message',
          qs: {
            version: CONVERSATION_VERSION
          },
          json: true,
          body: {
            input: {
              text: messageToSend
            },
            context: context
          }
        }, (error, response, body) => {
          if (error) {
            logging.reportError(error, rid)
            reject(error)
          } else {
            logging.content('util/conversation.js#toConversationPromise', rid, body, 'CONVERSATION RESPONSE')
            logging.exit('util/conversation.js#toConversationPromise', rid)
            contextMap[rid] = body.context
            resolve(body.output)
          }
        }
      )
      .auth(WORKSPACE_USER, WORKSPACE_PASS, false)
    } catch (e) {
      logging.reportError(e, rid)
      reject(e)
    }
  })
}

export {toConversationPromise, toConversation}
