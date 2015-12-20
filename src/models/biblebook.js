'use strict';

module.exports = function(sequelize, DataTypes) {
    var BibleBook = sequelize.define('BibleBook', {
        nr:
            {type: DataTypes.INTEGER,
            primaryKey: true
            },
        name: DataTypes.STRING,
        short_name: DataTypes.STRING,
        alternativeNames: DataTypes.STRING,
        language: DataTypes.STRING
    }, {
        classMethods: {associate(models) {
            // associations can be defined here
            BibleBook.hasMany(models.BibleVers, {foreignKey: 'bookNr_id'});
            return;
        }
        },
        createdAt: false,
        updatedAt: false
    });
    return BibleBook;
};
