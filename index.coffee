#################################################
express     = require 'express'
bodyParser  = require 'body-parser'
r           = require 'rethinkdb'
config      = require './config'
m           = require './middleware'
init        = require './init'
app         = express()
#################################################
app.use express.static(__dirname + '/public');  # Serve static content
app.use bodyParser();                           # Parse data sent to the server
app.use m.createConnection;                     # Create a RethinkDB connection
require('./routes')(app)                        # Define the routes
app.use m.closeConnection;                      # Close the RethinkDB connection previously opened
init.createDbIfNotExists()                      # init database if it does not exist
#################################################
app.listen config.express.port                  # hook up the server
console.log "Port: " + config.express.port      # print Port info
