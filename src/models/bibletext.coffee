'use strict'

module.exports = (sequelize, DataTypes) ->
    BibleText = sequelize.define('BibleText', {
        vers_id: DataTypes.INTEGER
        translationIdentifier_id: DataTypes.INTEGER
        versText: DataTypes.STRING
    }, {
        classMethods: associate: (models) ->
            # associations can be defined here
            BibleText.belongsTo models.BibleVers, foreignKey: 'vers_id'
            BibleText.belongsTo models.BibleTranslation, foreignKey: 'translationIdentifier_id'
            return
        createdAt: false
        updatedAt: false
    })
    BibleText
