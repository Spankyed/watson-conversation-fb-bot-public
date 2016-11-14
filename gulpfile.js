'use strict'

var gulp = require('gulp')
var gls = require('gulp-live-server') // Start up the server
var lint = require('gulp-eslint') // Lint JS files, including JSX
var babel = require('gulp-babel')
var clean = require('gulp-clean')

var config = {
  port: 3000,
  devBaseUrl: 'http://localhost',
  paths: {
    js: './src/**/*.js',
    dist: './dist',
    mainJs: './src/app/main.js'
  }
}

var server

gulp.task('server', ['lint', 'babel'], function () {
  server = gls.new('app.js')
  server.stop().then(function () {
    server.start()
  })
})

gulp.task('restartserver', ['lint', 'babel'], function () {
  server.stop().then(function () {
    console.log('server stopped')
    server.start().then(function () {
      console.log('starting server')
    })
  })
})

gulp.task('watch', ['watch:js'], function () {
})

gulp.task('watch:js', ['server'], function () {
  gulp.watch(config.paths.js, ['restartserver'])
})

gulp.task('lint', function () {
  gulp.src(['*.js', 'src/**/*.js'])
  .pipe(lint({configFile: './node_modules/standard/eslintrc.json'}))
  .pipe(lint.formatEach())
  .pipe(lint.result(result => {
    // Called for each ESLint result.
    console.log(`ESLint result: ${result.filePath}`)
    console.log(`# Messages: ${result.messages.length}`)
    console.log(`# Warnings: ${result.warningCount}`)
    console.log(`# Errors: ${result.errorCount}`)
  }))
})

gulp.task('babel', ['lint', 'clean'], () => {
  return gulp.src(['src/**/*.js'])
    .pipe(babel({
      presets: ['latest']
    }))
    .pipe(gulp.dest(config.paths.dist))
})

gulp.task('clean', function () {
  return gulp.src('./dist/', {read: false})
        .pipe(clean())
})

gulp.task('default', ['clean', 'lint', 'babel', 'server', 'watch'])

gulp.task('build', ['clean', 'lint', 'babel'])
