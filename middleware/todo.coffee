config      = require '../config'
r           = require 'rethinkdb'
m           = require './index'

module.exports =
    get: (req, res, next) ->
        r.table('todos').orderBy(index: 'createdAt').run req._rdbConn, (error, cursor) ->
            if error
                m.handleError res, error
                next()
            else
                cursor.toArray (error, result) ->
                    if error
                        m.handleError res, error
                    else
                        res.send JSON.stringify(result)

    create: (req, res, next) ->
        todo = req.body
        todo.createdAt = r.now()

        r.table('todos').insert(todo, returnChanges: true).run req._rdbConn, (error, result) ->
            if error
                m.handleError res, error
            else if result.inserted != 1
                m.handleError res, new Error('Document was not inserted.')
            else
                res.send JSON.stringify(result.change[0].new_val)
            next()

    update: (req, res, next) ->
        next()

    del: (req, res, next) ->
        next()