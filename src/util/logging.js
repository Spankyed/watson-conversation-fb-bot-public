// Utilities to clean up logging by using a standard set of outputs
var winston = require('winston')
var util = require('util')
// var cfenv = require('cfenv')
// var appEnv = cfenv.getAppEnv()
var mkdirp = require('mkdirp')

// Ensure that logging directories exist
mkdirp('../logs')

var logColors = {
  error: 'red',
  warn: 'magenta',
  info: 'cyan',
  debug: 'yellow',
  verbose: 'green'
}

// Setup transports
// Console logging
winston.level = process.env.LOG_LEVEL
winston.addColors(logColors)
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
  name: 'console',
  prettyPrint: true,
  colorize: true,
  silent: false,
  timestamp: false
})

/*
// Default file output

winston.add(winston.transports.File, {
  name: 'default',
  filename: '../logs/out.log',
  timestamp: true,
  maxFiles: 10,
  maxsize: 20971520,
  level: winston.level,
  json: false
})
*/

//
// Set of simple logging patterns to keep logs clean
//
module.exports = {
  entry: function (location, id, content, contentName) {
    standardOutput(location, id, content, contentName, 'ENTRY', 'verbose')
  },
  exit: function (location, id, content, contentName) {
    standardOutput(location, id, content, contentName, 'EXIT ', 'verbose')
  },
  content: function (location, id, content, contentName) {
    standardOutput(location, id, content, contentName, 'MID  ', 'debug')
  },
  new: function (location, id, content, contentName) {
    standardOutput(location, id, content, contentName, 'NEW  ', 'info')
  },
  done: function (location, id, content, contentName) {
    standardOutput(location, id, content, contentName, 'DONE ', 'info')
  },
  reportError: function (err, id) {
    winston.error(id + ': ' + 'Error Caught.')
    winston.error(util.inspect(err))
  },
  info: function (id, msg) {
    winston.info('   ' + id + ': ' + msg)
  },
  debug: function (id, msg) {
    winston.debug('  ' + id + ': ' + msg)
  },
  trace: function (id, msg) {
    winston.trace('  ' + id + ': ' + msg)
  },
  error: function (id, msg) {
    winston.error('  ' + id + ': ' + msg)
  },
  warn: function (id, msg) {
    winston.warn('   ' + id + ': ' + msg)
  },
  verbose: function (id, msg) {
    winston.verbose('' + id + ': ' + msg)
  }
}

//
// Helper function to determine if content is a HTTP Client Request
//
function isHTTPReq (content) {
  if (content.query && content.body && content.headers) {
    return true
  } else {
    return false
  }
}

//
// Helper function to write HTTP Request to logs
//
function logHTTPContent (content, contentName) {
  winston.debug('HTTP Content of ' + contentName + ':')
  winston.debug('|-- HEADERS: ' + util.inspect(content.headers, {showHidden: false, depth: null, colorize: true}))
  if (content.query) {
    winston.debug('|-- QUERY: ' + util.inspect(content.query, {showHidden: false, depth: null, colorize: true}))
  }
  winston.debug('|-- BODY: ' + util.inspect(content.body, {showHidden: false, depth: null, colorize: true}))
  winston.debug('|__________')
}

//
// Helper function to write generic content to logs
//
function logContent (content, contentName) {
  try {
    winston.debug('Content of ' + contentName + ':')
    winston.debug('|-- CONTENT: ' + util.inspect(content, {showHidden: false, depth: null, colorize: true}))
    winston.debug('|__________')
  } catch (e) {
    winston.debug('Could not log content')
    winston.info(e)
  }
}

//
// Helper function to write standard form entries to logs
//
function standardOutput (location, id, content, contentName, point, level) {
  var blankSpace = 7 - level.length
  winston.log(level, ' '.repeat(blankSpace) + point + ': ' + id + ' @ ' + location)
  if (content && contentName) {
    if (isHTTPReq(content)) {
      logHTTPContent(content, contentName)
    } else {
      logContent(content, contentName)
    }
  }
}
