config      = require '../config'
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

    closeConnection: (req, res, next) ->
        req._rdbConn.close()
        next()