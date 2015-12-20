'use strict';

module.exports = function(sequelize, DataTypes) {
    var BibleSequence = sequelize.define('BibleSequence', {
        bibleText_id: DataTypes.INTEGER,
        sequenceText: DataTypes.STRING,
        sequenceOrder: DataTypes.INTEGER
    }, {
        classMethods: {associate(models) {
            // associations can be defined here
            BibleSequence.belongsTo(models.BibleText, {foreignKey: 'bibleText_id'});
            return;
        }
        },
        createdAt: false,
        updatedAt: false
    });
    return BibleSequence;
};
