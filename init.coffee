r           = require 'rethinkdb'
config      = require './config'

module.exports =
    ###
    ## This creates the db. If there occurs an error
    ## it will be printed out. If it succeeds, the
    ## callback next will be called.
    ###
    createDb: (next) ->
        r.dbCreate(config.rethinkdb.db).run @conn, (err, result) =>
            if (err) and (not err.message.match(/Database `.*` already exists/))
                console.log "Could not create the database `" + config.db + "`"
                console.log err
                process.exit 1
            console.log "Database `" + config.rethinkdb.db + "` created."
            if next?
                next()


    ###
    ## This creates the given table. The table param
    ## is either a string with the table name or an
    ## object with at least one parameter 'name' and
    ## optional the indices to create as string array.
    ## If there occurs an error it will be printed out.
    ## If it succeeds, the callback next will be called.
    ###
    createTable: (table, next) ->
        if typeof(table) is 'string'
            table = name: table, indices: []

        r.tableCreate(table.name).run @conn, (err, result) =>
            if (err) and (not err.message.match(/Table `.*` already exists/))
                console.log "Could not create the table `" + table.name + "`"
                console.log err
                process.exit 1
            console.log "Table `" + table.name + "` created."

        # create indices
        if table.indices?
            for idx in table.indices
                @createIndex table.name, idx

        if next?
            next()


    ###
    ## This creates the given index for the given
    ## table. If there occurs an error
    ## it will be printed out. If it succeeds, the
    ## callback next will be called.
    ###
    createIndex: (tableName, indexName, next) ->
        r.table(tableName).indexCreate(indexName).run @conn, (err, result) =>
            if (err) and (not err.message.match(/Index `.*` already exists/))
                console.log "Could not create the index `" + tableName + "." + indexName + "`"
                console.log err
                process.exit 1
            console.log "Index `" + tableName + "." + indexName + "` created."
            r.table(tableName).indexWait(indexName).run @conn, (err, result) =>
                if err
                    console.log "Could not wait for the completion of the index `" + tableName + "." + indexName + "`"
                    console.log err
                    process.exit 1
                console.log "Index `" + tableName + "." + indexName + "` ready."
                if next?
                    next()


    ###
    ## Check if database exists. If it does not exist
    ## create it and create all tables and indices.
    ## The names of the Db, tables and indices are
    ## specified in config.coffee
    ###
    createDbIfNotExists: () ->
        r.connect config.rethinkdb, (err, connection) =>
            if err
                console.log "Could not open a connection to initialize the database"
                console.log err.message
                process.exit 1

            # save connection object
            @conn = connection

            # check if a database exists
            r.dbList().run @conn, (err, result) =>
                # check length of result
                if result.length == 0
                    # create db
                        @createDb () =>
                            # create all tables
                            for table in config.rethinkdb.tables
                                @createTable table