r           = require 'rethinkdb'
config      = require __dirname + '/config'

module.exports =
    ###
    # Create tables/indexes then start express
    ###
    createDbIfNotExists: () ->
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

                        r.tableCreate("bible").run conn, (err, result) ->
                            if (err) and (not err.message.match(/Table `.*` already exists/))
                                console.log "Could not create the table `bible`"
                                console.log err
                                process.exit 1
                            console.log "Table `bible` created."