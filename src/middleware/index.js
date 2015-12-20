var config      = require('../config');
var r           = require('rethinkdb');
var Sequelize   = require('sequelize');

module.exports =
    {createConnection(req, res, next) {
        return r.connect(config.rethinkdb, function(error, conn) {
            if (error) {
                return handleError(res, error);
            } else {
                req._rdbConn = conn;
                return next();
            }
        });
    },

    handleError(res, error) {
        return res.send(500, {error: error.message});
    },

    closeConnection(req, res, next) {
        req._rdbConn.close();
        return next();
    },

    createSequelize(req, res, next) {
        var sequelize = new Sequelize( 'strongs', null, null,
            {storage: 'strongs.sqlite',
            dialect: 'sqlite'
        });
        return sequelize.complete(function(err) {
            if (!err) {
                return console.log('Unable to connect to database:', err);
            } else {
                console.log('Connection has been established');
                req.sequelize = sequelize;
                return next();
            }
        });
    }
};
