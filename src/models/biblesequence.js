'use strict';

module.exports = function(sequelize, DataTypes) {
    var BibleSequence = sequelize.define('BibleSequence', {
        vers_id: DataTypes.INTEGER,
        translationIdentifier_id: DataTypes.INTEGER,
        sequenceText: DataTypes.STRING,
        sequenceOrder: DataTypes.INTEGER,
        strongNumber: DataTypes.INTEGER,
        grammar: DataTypes.STRING
    }, {
        classMethods: {associate(models) {
            // associations can be defined here
            BibleSequence.belongsTo(models.BibleVers, {foreignKey: 'vers_id'});
            BibleSequence.belongsTo(models.BibleTranslation, {foreignKey: 'translationIdentifier_id'});
            return;
        }
        },
        createdAt: false,
        updatedAt: false
    });
    return BibleSequence;
};
