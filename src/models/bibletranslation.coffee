'use strict'

module.exports = (sequelize, DataTypes) ->
    BibleTranslation = sequelize.define('BibleTranslation', {
        identifier:
            type: DataTypes.STRING
            primaryKey: true
        language: DataTypes.STRING
        name: DataTypes.STRING
    }, {
        classMethods: associate: (models) ->
            # associations can be defined here
            BibleTranslation.hasMany models.BibleText, foreignKey: 'translationIdentifier_id'
            BibleTranslation.hasMany models.StrongNr, foreignKey: 'translationIdentifier_id'
            return
        createdAt: false
        updatedAt: false
    })
    BibleTranslation
