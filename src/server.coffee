#!/usr/bin/env coffee

#################################################
express     = require 'express'
bodyParser  = require 'body-parser'
config      = require './config'
models      = require './models'
# https       = require 'https'
http        = require 'http'
fs          = require 'fs'
app         = express()
#################################################

class Server
    constructor: ->
        # sslkey = fs.readFileSync 'ssl-key.pem'
        # sslcert = fs.readFileSync 'ssl-cert.pem'
        # options = key: sslkey, cert: sslcert

        app.use (req, res, next) ->                     # Allow cross origin requests (CORS)
            res.header 'Access-Control-Allow-Origin', '*'
            res.header 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
            next()
        app.use express.static(__dirname + '/public');  # Serve static content
        app.use bodyParser();                           # Parse data sent to the server
        require('./routes')(app)                        # Define the routes

    start: (done) ->
        models.sequelize.sync().then () ->
            # https.createServer(options, app).listen config.express.port               # hook up the server
            http.createServer(app).listen config.express.port                           # hook up the server
            console.log "Port: " + config.express.port                                  # print Port info
            if done?
                done()

module.exports = Server
