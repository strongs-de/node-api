'use strict'
fs = require('fs')
path = require('path')
Sequelize = require('sequelize')
basename = path.basename(module.filename)
env = process.env.NODE_ENV or 'development'
config = require(__dirname + '/../config/config.json')[env]
sequelize = new Sequelize(config.database, config.username, config.password, config)
db = {}
fs.readdirSync(__dirname).filter((file) ->
    file.indexOf('.') != 0 and file != basename
).forEach (file) ->
    model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
    return
Object.keys(db).forEach (modelName) ->
    if db[modelName].associate?
        db[modelName].associate db
    return
db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db
