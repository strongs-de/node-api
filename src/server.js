#!/usr/bin/env node
"use strict";

/////////////////////////////////////////////
var express     = require('express');
var bodyParser  = require('body-parser');
var config      = require('./config');
var models      = require('./models');
// https       = require 'https'
var http        = require('http');
var fs          = require('fs');
var app         = express();
/////////////////////////////////////////////

class Server {
    constructor() {
        // sslkey = fs.readFileSync 'ssl-key.pem'
        // sslcert = fs.readFileSync 'ssl-cert.pem'
        // options = key: sslkey, cert: sslcert

        app.use(function(req, res, next) {                     // Allow cross origin requests (CORS)
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            return next();
        });
        app.use(express.static(__dirname + '/public')),  // Serve static content
        app.use(bodyParser()),                           // Parse data sent to the server
        require('./routes')(app);                        // Define the routes
    }

    start(done) {
        return models.sequelize.sync().then(function() {
            // https.createServer(options, app).listen config.express.port               # hook up the server
            http.createServer(app).listen(config.express.port);                           // hook up the server
            console.log("Port: " + config.express.port);                                  // print Port info
            if ((typeof done !== "undefined" && done !== null)) {
                return done();
            }
        });
    }
}

module.exports = Server;
