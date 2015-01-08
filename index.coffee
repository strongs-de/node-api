express     = require 'express'
bodyParser  = require 'body-parser'
r           = require 'rethinkdb'
config      = require __dirname + '/config'
m           = require __dirname + '/middlewares'
app         = express()

# Static files
app.use express.static(__dirname + '/public'); # Serve static content

app.use bodyParser();                          # Parse data sent to the server
app.use m.createConnection;                      # Create a RethinkDB connection

# Define the main routes
app.route('/todo/get').get m.get;                # Retrieve all the todos
app.route('/todo/new').put m.create;             # Create a new todo
app.route('/todo/update').post m.update;         # Update a todo
app.route('/todo/delete').post m.del;            # Delete a todo

app.use m.closeConnection;                       # Close the RethinkDB connection previously opened


#########################

#
# * Create tables/indexes then start express
#

r.connect config.rethinkdb, (err, conn) ->
    if err
        console.log "Could not open a connection to initialize the database"
        console.log err.message
        process.exit 1

    r.table("todos").indexWait("createdAt").run conn, (err, result) ->
        if err
            r.dbCreate(config.rethinkdb.db).run conn, (err, result) ->
                if (err) and (not err.message.match(/Database `.*` already exists/))
                    console.log "Could not create the database `" + config.db + "`"
                    console.log err
                    process.exit 1
                console.log "Database `" + config.rethinkdb.db + "` created."
                r.tableCreate("todos").run conn, (err, result) ->
                    if (err) and (not err.message.match(/Table `.*` already exists/))
                        console.log "Could not create the table `todos`"
                        console.log err
                        process.exit 1
                    console.log "Table `todos` created."
                    r.table("todos").indexCreate("createdAt").run conn, (err, result) ->
                        if (err) and (not err.message.match(/Index `.*` already exists/))
                            console.log "Could not create the index `todos`"
                            console.log err
                            process.exit 1
                        console.log "Index `createdAt` created."
                        r.table("todos").indexWait("createdAt").run conn, (err, result) ->
                            if err
                                console.log "Could not wait for the completion of the index `todos`"
                                console.log err
                                process.exit 1
                            console.log "Index `createdAt` ready."
                            console.log "Table and index are available, starting express..."
                            startExpress()
                            conn.close()
                            return

                        return

                    return

                return

        else
            console.log "Table and index are available, starting express..."
            startExpress()
        return

    return

# The database/table/index was not available, create them
startExpress = ->
    app.listen config.express.port
    console.log "Listening on port " + config.express.port
    return
