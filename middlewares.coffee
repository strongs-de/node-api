config      = require __dirname + '/config'
r           = require 'rethinkdb'

module.exports =
    createConnection: (req, res, next) ->
        r.connect config.rethinkdb, (error, conn) ->
            if error
                handleError(res, error)
            else
                req._rdbConn = conn;
                next()

    handleError: (res, error) ->
        return res.send 500, error: error.message

    get: (req, res, next) ->
        r.table('todos').orderBy(index: 'createdAt').run req._rdbConn, (error, cursor) ->
            if error
                handleError res, error
                next()
            else
                cursor.toArray (error, result) ->
                    if error
                        handleError res, error
                    else
                        res.send JSON.stringify(result)

    create: (req, res, next) ->
        todo = req.body
        todo.createdAt = r.now()

        r.table('todos').insert(todo, returnChanges: true).run req._rdbConn, (error, result) ->
            if error
                handleError res, error
            else if result.inserted != 1
                handleError res, new Error('Document was not inserted.')
            else
                res.send JSON.stringify(result.change[0].new_val)
            next()

    update: (req, res, next) ->
        next()

    del: (req, res, next) ->
        next()

    closeConnection: (req, res, next) ->
        req._rdbConn.close()
        next()