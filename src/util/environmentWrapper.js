import cfenv from 'cfenv'
let appEnv = cfenv.getAppEnv()
console.log('APP ENV')
console.log(appEnv)

// Load the initial env vars. Allow them to be loaded from CF environment variables
// or from a dotenv file
function initEnv () {
  process.env.LOG_LEVEL = appEnv.LOG_LEVEL ? appEnv.LOG_LEVEL : process.env.LOG_LEVEL
  process.env.WEBHOOK_TOKEN = appEnv.WEBHOOK_TOKEN ? appEnv.WEBHOOK_TOKEN : process.env.WEBHOOK_TOKEN
  process.env.WORKSPACE_ID = appEnv.WORKSPACE_ID ? appEnv.WORKSPACE_ID : process.env.WORKSPACE_ID
  process.env.WORKSPACE_USER = appEnv.WORKSPACE_USER ? appEnv.WORKSPACE_USER : process.env.WORKSPACE_USER
  process.env.WORKSPACE_PASS = appEnv.WORKSPACE_PASS ? appEnv.WORKSPACE_PASS : process.env.WORKSPACE_PASS
  process.env.FACEBOOK_SEND_ENDPT = appEnv.FACEBOOK_SEND_ENDPT ? appEnv.FACEBOOK_SEND_ENDPT : process.env.FACEBOOK_SEND_ENDPT
  process.env.FACEBOOK_SEND_TOKEN = appEnv.FACEBOOK_SEND_TOKEN ? appEnv.FACEBOOK_SEND_TOKEN : process.env.FACEBOOK_SEND_TOKEN
  process.env.CONVERSATION_ENDPT = appEnv.CONVERSATION_ENDPT ? appEnv.CONVERSATION_ENDPT : process.env.CONVERSATION_ENDPT
  process.env.CONVERSATION_VERSION = appEnv.CONVERSATION_VERSION ? appEnv.CONVERSATION_VERSION : process.env.CONVERSATION_VERSION

  console.log('ENV VARS')
  console.log(process.env)
}

function getAppEnv () {
  return cfenv.getAppEnv()
}

export {initEnv, getAppEnv}
