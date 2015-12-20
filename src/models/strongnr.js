'use strict';

module.exports = function(sequelize, DataTypes) {
    var StrongNr = sequelize.define('StrongNr', {
        strongNr: DataTypes.INTEGER,
        translationIdentifier_id: DataTypes.INTEGER,
        vers_id: DataTypes.INTEGER,
        grammar: DataTypes.STRING,
        greek: DataTypes.STRING,
        pronounciation: DataTypes.STRING
    }, {
        classMethods: {associate(models) {
            // associations can be defined here
            StrongNr.belongsTo(models.BibleTranslation, {foreignKey: 'translationIdentifier_id'});
            StrongNr.belongsTo(models.BibleVers, {foreignKey: 'vers_id'});
            return;
        }
        },
        createdAt: false,
        updatedAt: false
    });
    return StrongNr;
};
