config      = require '../config'
r           = require 'rethinkdb'
Sequelize   = require 'sequelize'

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

    createSequelize: (req, res, next) ->
        sequelize = new Sequelize 'strongs', null, null,
            storage: 'strongs.sqlite'
            dialect: 'sqlite'
        sequelize.complete (err) ->
            if !!err
                console.log 'Unable to connect to database:', err
            else
                console.log 'Connection has been established'
                req.sequelize = sequelize
                next()
