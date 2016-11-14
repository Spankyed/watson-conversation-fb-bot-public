import request from 'request'
import logging from '../util/logging'

// Awaits the receipt of sent messages. Will return true if they all go where
// they are supposed to go. False if at least one failed.
async function sendMessageToUser (messageToSend, recipientId, attachment) {
  logging.entry('util/facebookSend.js#sendMessageToUser', recipientId)
  try {
    if (attachment) {
      // Delay to make it more human
      await sendMessageTypingPromiseFactory(recipientId)
      await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 1000) })
      await sendMessagePromiseFactory('ATTACHMENT', recipientId, attachment)
    }
    // If we have just a plain string. Not sure if this is ever the case.
    if (typeof messageToSend === 'string') {
      for (let chunk of chunkMessage(messageToSend)) {
        // Delay to make it more human
        await sendMessageTypingPromiseFactory(recipientId)
        await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 1000) })
        await sendMessagePromiseFactory(chunk, recipientId, null)
      }
    // Basically the normal path. Process an array of messages
    } else if (Array.isArray(messageToSend)) {
      for (let message of messageToSend) {
        for (let chunk of chunkMessage(message)) {
          // Delay to make it more human
          await sendMessageTypingPromiseFactory(recipientId)
          await new Promise((resolve, reject) => { setTimeout(() => { resolve() }, 1000) })
          await sendMessagePromiseFactory(chunk, recipientId, null)
        }
      }
    }
    logging.exit('util/facebookSend.js#sendMessageToUser', recipientId)
    return true
  } catch (e) {
    logging.reportError(e, recipientId)
    return false
  }
}

function chunkMessage (message) {
  let ret = []
  do {
    if (message.length <= 295) {
      ret.push(message)
      message = ''
    } else {
      ret.push(message.slice(0, 295))
      message = message.substring(295, message.length)
    }
  } while (message.length > 0)

  return ret
}

// Factory for send message promises
function sendMessagePromiseFactory (messageToSend, recipientId, attachment) {
  return new Promise((resolve, reject) => {
    try {
      logging.entry('util/facebookSend.js#sendMessagePromiseFactory', recipientId)
      // Send text or attachment, as appropriate
      let message = {}
      if (attachment) {
        message.attachment = attachment
      } else {
        message.text = messageToSend
      }

      // POST the request to the API
      // Please note that Facebook controls how messages are sent. Please Ensure
      // that your facebook developer settings are correctly configured.
      request
        .post({
          url: process.env.FACEBOOK_SEND_ENDPT,
          qs: {
            access_token: process.env.FACEBOOK_SEND_TOKEN
          },
          json: true,
          body: {
            recipient: {
              id: recipientId
            },
            message: message
          }
        }, (error, response, body) => {
          if (error) {
            logging.reportError(error, recipientId)
            reject(error)
          } else {
            logging.exit('util/facebookSend.js#sendMessagePromiseFactory', recipientId, body, 'FACEBOOK RESPONSE')
            resolve()
          }
        })
    } catch (e) {
      logging.reportError(e, recipientId)
      reject(e)
    }
  })
}

// Factory to send the user is typing signal to messenger
function sendMessageTypingPromiseFactory (recipientId) {
  return new Promise((resolve, reject) => {
    try {
      logging.entry('util/facebookSend.js#sendMessageTypingPromiseFactory', recipientId)

      // POST the request to the API
      // Please note that Facebook controls how messages are sent. Please Ensure
      // that your facebook developer settings are correctly configured.
      request
        .post({
          url: process.env.FACEBOOK_SEND_ENDPT,
          qs: {
            access_token: process.env.FACEBOOK_SEND_TOKEN
          },
          json: true,
          body: {
            recipient: {
              id: recipientId
            },
            sender_action: 'typing_on'
          }
        }, (error, response, body) => {
          if (error) {
            logging.reportError(error, recipientId)
            reject(error)
          } else {
            logging.exit('util/facebookSend.js#sendMessageTypingPromiseFactory', recipientId, body, 'FACEBOOK RESPONSE')
            resolve()
          }
        })
    } catch (e) {
      logging.reportError(e, recipientId)
      reject(e)
    }
  })
}

export {sendMessageToUser}
