config      = require '../config'
r           = require 'rethinkdb'
m           = require './index'

module.exports =
    get: (req, res, next) ->
        r.table('bible_' + req.params.translations)
            .filter
                bookNumber: parseInt(req.params.bookNumber, 10)
                chapterNumber: parseInt(req.params.chapterNumber, 10)
            .orderBy('versNumber')
            .run req._rdbConn, (error, cursor) ->
                if error
                    m.handleError res, error
                    next()
                else
                    cursor.toArray (error, result) ->
                        if error
                            m.handleError res, error
                        else
                            res.send JSON.stringify(result)
