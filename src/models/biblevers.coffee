'use strict'

module.exports = (sequelize, DataTypes) ->
    BibleVers = sequelize.define('BibleVers', {
        bookNr_id: DataTypes.INTEGER
        chapterNr: DataTypes.INTEGER
        versNr: DataTypes.INTEGER
    }, {
        classMethods: associate: (models) ->
            # associations can be defined here
            BibleVers.hasMany models.BibleText, foreignKey: 'vers_id'
            BibleVers.belongsTo models.BibleBook, foreignKey: 'bookNr_id'
            BibleVers.hasMany models.StrongNr, foreignKey: 'vers_id'
            return
        createdAt: false
        updatedAt: false
    })
    BibleVers
