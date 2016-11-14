# Watson Conversation Facebook Bot
### A simple application to access your conversation services through Facebook messenger

This application makes it simple to connect your Watson Conversation service to Facebook messenger. There are four high level steps.
1. Compile the application using gulp and the provided gulpfile
2. Deploy.
3. Setup your Facebook application on the Facebook Developer console
4. Adjust your deployed application's environment variables as appropriate and restart the app

The app is designed to be deployed to a cloud environment and to sit behind a proxy. Facebook's webhooks require a secure connection, and a cloud environment such as Bluemix will provide the ability to connect externally over HTTP and HTTPS through its proxy. Behind the proxy, the application communicates with the proxy. If the application is not deployed to a cloud environment with a web proxy in front of the application, the procedure to prepare the application is outlined in **Deploying the application with no proxy**
## Installing and Configuring the Bot
### Compiling the application
The application requires compilation before it can be used. To compile the application, first ensure that all dev dependencies are available. This can be done by issuing the following command from the project's root directory:
```
npm install
```
Once the dev dependencies are installed, use gulp and the packaged gulpfile to build the application.

If gulp has not been installed globally, issue the following command
```
sudo npm install -g gulp
```
Execute the build task by executing the following command from the project root directory
```
gulp build
```
Verify the output from the build task. If no errors are reported, the build was successful.

The app can then be started with the following command.
```
npm start
```
Or to rebuild and restart the server.
```
gulp
```
### Deploy the application
Deploy the compiled application. A base manifest.yml is provided to help facilitate cloud deployments

### Setting up your Facebook application
1. Create a new Facebook application (and developer ID if needed) at developer.facebook.com
2. Select add services under the new application and select to use Facebook messenger services for this application
3. Subscribe to messages and messaging_postback webhooks at https://<YOUR_APP_ADDRESS>/incoming. Facebook will indicate if the webhook subscription was successful. The verification word can be specified in the environment variables WEBHOOK_TOKEN, and it is 'helloWatson' by default. Remember that environment variable changes require an app restart.
4. Select the Facebook page that you want to subscribe to. IF not already done, please create a facebook page for your app,  This is the 'face' of your app. Users will send a message to this page to communicate with the bot. When you select your app's page, you will receive a page token. Set the environment variable FACEBOOK_SEND_TOKEN to this value, so that Facebook will know that it is sending messages from this page's account.

#### Regarding Facebook's permissions
Facebook has taken steps to prevent spammers from using their messenger platform. There are a few guidlines that developers should be aware of as a result.

1. Apps cannot initiate conversations. The user has to initiate the chat with the page, and after that interaction, the page can send a message via API for up to 24 hours.
2. Apps cannot interact with the public without being reviewed. Until an application is reviewed, the app will only be able to interact with users that are assigned a 'tester' role or higher. This can be managed on the Facebook Developer console.

### Adjusting environment variables
The following environment variables should be set:
- LOG_LEVEL='info'
  - This controls the logging present in the app. Valid settings are standard log levels (info, verbose, debug, etc...)
- WEBHOOK_TOKEN='helloWatson'
  - This is confirmation token when subscribing to webhook events from facebook. This should match the value specified when setting up the subscription on facebook
- WORKSPACE_ID=''
  - This is the workspace ID for the conversation service
- WORKSPACE_USER=''
  - This is the username for the conversation service
- WORKSPACE_PASS=''
  - This is the password for the conversation service
- FACEBOOK_SEND_ENDPT='https://graph.facebook.com/v2.6/me/messages'
  - Endpoint for facebook send API. Should not ever have to change this.
- FACEBOOK_SEND_TOKEN=''
  - Token indicating which page to send messages on behalf of. This is found on the Facebook developer console.
- CONVERSATION_VERSION='2016-09-20'
  - Version of the conversation service to use. Specify

There are multiple ways that environment variables can be set. In a cloud foundry environment, environment varaibles can be set by the CLI or GUI. Otherwise, the system will attempt to pull a value from a .env file located in the project root. An example .env file is provided.

The application will first try to get an environment variable from the cloud foundry environment. If it is unable to find a value for that particular environment variable, it will fall back to the value specified in the .env file.

>**Please be aware that environment variable changes are realized only when the app is restarted!**

### Deploying the application with no proxy
The application is designed to listen over the HTTP protocol. When deployed to a cloud environment such as Bluemix, a proxy sits in front of the application and will handle external requests on both HTTP and HTTPS, while internally communicating over HTTP. If that layer is not present, the application will need to listen natively over the secure protocol, because Facebook requires a secure connection for its webhooks. This can be configured in express in /src/app/app.js.

## Using the Facebook bot
### Simple Nodes
The bot will work with all simple nodes. It will send the content of each node as a message or messages (if needed).
### Advanced Nodes and Media enrichment
If advanced nodes are in place, the bot will be able to send messages enriched with media content. First, the bot will check if an [attachment](https://developers.facebook.com/docs/messenger-platform/send-api-reference) is present at output.attachment. If it finds an attachment object, it will send that object as a standalone message before any text messages. Valid attachment descriptions are available at the [Facebook Send API Documentation](https://developers.facebook.com/docs/messenger-platform/send-api-reference).

#### Example advanced node
```
{
  "output": {
    "text": "Hello. I will first display an image, then I will send this text",
    "attachment": {
      "type": "image",
      "payload": {
        "url": "http://MYSITE.COM/MYIMAGE.png"
      }
    }
  }
}
```
After an attachment has been sent, the bot will send the content of output.text. Output.text can be specified as a String or an Array of Strings. All of these strings will be checked and broken up into smaller messages as needed.

The order in which the messages are sent is always: attachment (if present), text (array starting at index 0).
