config      = require '../config'
r           = require 'rethinkdb'
m           = require './index'

module.exports =
    get: (req, res, next) ->
        r.table('bible').run req._rdbConn, (error, cursor) ->
            if error
                m.handleError res, error
                next()
            else
                cursor.toArray (error, result) ->
                    if error
                        m.handleError res, error
                    else
                        res.send JSON.stringify(result)
