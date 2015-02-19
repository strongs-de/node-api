#################################################
express     = require 'express'
bodyParser  = require 'body-parser'
config      = require './config'
models      = require './models'
app         = express()
#################################################
app.use (req, res, next) ->                     # Allow cross origin requests (CORS)
    res.header 'Access-Control-Allow-Origin', '*'
    res.header 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
    next()
app.use express.static(__dirname + '/public');  # Serve static content
app.use bodyParser();                           # Parse data sent to the server
require('./routes')(app)                        # Define the routes
#################################################
models.sequelize.sync().then () ->
    app.listen config.express.port                # hook up the server
    console.log "Port: " + config.express.port    # print Port info
