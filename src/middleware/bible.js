'use strict';

var models = require('../models');
var _ = require('underscore');


class BibleMiddleware {
    /**
     * t is the bible array that is returned from the sequelite select, while res
     * is the result object for the http request.
     */
    handleBibleResults(t, res) {
        // if no entry could be found, return status 500 (e.g. wrong chapter number)
        if (t.length <= 0) {
            return res.status(500).json('ERROR: Could not find any bible chapter for these parameters!');
        }

        // modify json data
        var newT = {};
        t = t.map(function(item) {
            var newItem = {
                translation: {
                    identifier: item.BibleTranslation.identifier,
                    name: item.BibleTranslation.name
                },
                book: {
                    nr: item.BibleVer.BibleBook.nr,
                    name: item.BibleVer.BibleBook.name,
                    shortName: item.BibleVer.BibleBook.short_name
                },
                chapter: item.BibleVer.chapterNr,
                vers: item.BibleVer.versNr,
                sequenceOrder: item.sequenceOrder,
                sequenceText: item.sequenceText,
                strongNumber: item.strongNumber,
                grammar: item.grammar
            };
            return newItem;
        });
        t = _.groupBy(t, function(o) {
            return o.translation.identifier;
        });
        newT = {
            translations: []
        };
        for (var prop in t) {
            var val = t[prop];
            var newObject = {
                translation: val[0].translation,
                book: val[0].book,
                chapter: val[0].chapter,
                verses: []
            };
            var groupedVal = _.groupBy(val, function(o) {
                return o.vers;
            });
            newObject.verses = _.map(groupedVal, function(o, versNumber) {
                var sequences = _.map(o, function(oo) {
                    return {
                        sequenceOrder: oo.sequenceOrder,
                        strongNumber: oo.strongNumber,
                        sequenceText: oo.sequenceText,
                        grammar: oo.grammar
                    };
                });
                return {
                    versNumber: versNumber,
                    text: sequences
                };
            });
            newT.translations.push(newObject);
        }
        return res.status(200).json(newT);
    }
    
    /**
     * t is the bible array that is returned from the sequelite select, while res
     * is the result object for the http request.
     */
    handleBibleSearch(t, res) {
        //return this.handleBibleResults(t, res);


        // modify json data
        if (t.length <= 0) {
            return res.status(200).json({});
        }
        t = t.map(function(item) {
            var newItem = {
                translation: {
                    identifier: item.BibleTranslation.identifier,
                    name: item.BibleTranslation.name
                },
                book: {
                    nr: item.BibleVer.BibleBook.nr,
                    name: item.BibleVer.BibleBook.name,
                    shortName: item.BibleVer.BibleBook.short_name
                },
                chapter: item.BibleVer.chapterNr,
                vers: item.BibleVer.versNr,
                sequenceOrder: item.sequenceOrder,
                sequenceText: item.sequenceText,
                strongNumber: item.strongNumber,
                grammar: item.grammar
            };
            return newItem;
        });
        t = _.groupBy(t, function(o) {
            return o.translation.identifier;
        });
        var newT = {
            translations: []
        };
        for (var prop in t) {
            var val = t[prop];
            var newObject = {
                translation: val[0].translation,
                verses: []
            };
            var groupedVal = _.groupBy(val, function(o) {
                return o.book.nr + '#' + o.chapter + '#' + o.vers;
            });
            newObject.verses = _.map(groupedVal, function(o, versNumber) {
                var sequences = _.map(o, function(oo) {
                    return {
                        sequenceOrder: oo.sequenceOrder,
                        strongNumber: oo.strongNumber,
                        sequenceText: oo.sequenceText,
                        grammar: oo.grammar
                    };
                });
                return {
                    book: o[0].book,
                    chapter: o[0].chapter,
                    versNumber: o[0].vers,
                    text: sequences
                };
            });
            newT.translations.push(newObject);
        }
        return res.status(200).json(newT);
    }
}

var middleware = new BibleMiddleware();

module.exports = {
    get: function(req, res) {
        // split all translations
        var translations = req.params.translations.split(',');

        // check parameters
        var bookNumber = parseInt(req.params.bookNumber);
        if (bookNumber > 66) {
            return res.status(500).json('ERROR: Bible book with number ' + bookNumber + ' does not exist!');
        }

        // build the select statement
        var select = models.BibleSequence.findAll({
            include: [{
                model: models.BibleVers,
                where: {
                    bookNr_id: bookNumber,
                    chapterNr: parseInt(req.params.chapterNumber)
                },
                order: 'versNr',
                include: models.BibleBook
            }, {
                model: models.BibleTranslation
            }],
            where: {
                translationIdentifier_id: translations
            },
            order: ['translationIdentifier_id', 'BibleVer.BibleBook.nr', 'BibleVer.chapterNr', 'BibleVer.versNr', 'sequenceOrder']
        });
        
        // execute the select
        return select.then(function(t) {
            return middleware.handleBibleResults(t, res);
        }).catch(function(e) {
            return res.status(500).json(e);
        });
    },

    search: function(req, res) {
        // split all translations
        var translations = req.params.translations.split(',');

        // build the vers search object
        var whereObj = {};
        if ((req.params.bookNumber != null)) {
            whereObj.bookNr_id = bookNumber;

            // check parameters
            var bookNumber = parseInt(req.params.bookNumber);
            if (bookNumber > 66) {
                return res.status(500).json('ERROR: Bible book with number ' + bookNumber + ' does not exist!');
            }
        }

        if ((req.params.chapterNumber != null)) {
            whereObj.chapterNr = parseInt(req.params.chapterNumber);
        }

        // build the select statement
        var select = models.BibleSequence.findAll({
            include: [{
                model: models.BibleVers,
                where: whereObj,
                order: 'versNr',
                include: models.BibleBook
            }, {
                model: models.BibleTranslation
            }],
            where: {
                translationIdentifier_id: translations,
                sequenceText: {
                    $like: '%' + req.params.searchString + '%'
                }
            },
            order: 'translationIdentifier_id'
        }).then(function(result1) {
            var versIds = _.map(result1, function(item) {
                return item.BibleVer.id;
            });
            return models.BibleSequence.findAll({
                include: [{
                    model: models.BibleVers,
                    where: whereObj,
                    order: 'versNr',
                    include: models.BibleBook
                }, {
                    model: models.BibleTranslation
                }],
                where: {
                    translationIdentifier_id: translations,
                    vers_id: {
                        $in: versIds
                    }
                },
                order: ['translationIdentifier_id', 'BibleVer.BibleBook.nr', 'BibleVer.chapterNr', 'BibleVer.versNr', 'sequenceOrder']
            });
        });

        // 1) search for bible verses which contains the search keyword
        var select = models.BibleSequence.findAll({
            include: [{
                model: models.BibleVers,
                where: whereObj,
                order: 'versNr'
            }],
            where: {
                translationIdentifier_id: translations,
                sequenceText: {
                    $like: '%' + req.params.searchString + '%'
                }
            },
            order: 'translationIdentifier_id'
        }).then(function(result1) {
            var versIds = _.map(result1, function(item) {
                return item.BibleVer.id;
            });
            return models.BibleSequence.findAll({
                include: [{
                    model: models.BibleVers,
                    where: whereObj,
                    order: 'versNr',
                    include: models.BibleBook
                }, {
                    model: models.BibleTranslation
                }],
                where: {
                    translationIdentifier_id: translations,
                    vers_id: {
                        $in: versIds
                    }
                },
                order: ['translationIdentifier_id', 'BibleVer.BibleBook.nr', 'BibleVer.chapterNr', 'BibleVer.versNr', 'sequenceOrder']
            });
        });

        /*var select = models.BibleSequence.findAll({
            include: [{
                model: models.BibleVers,
                where: whereObj,
                order: 'versNr',
                include: models.BibleBook
            }, {
                model: models.BibleTranslation
            }],
            where: {
                translationIdentifier_id: translations,
                sequenceText: {
                    $like: '%' + req.params.searchString + '%'
                }
            },
            order: 'translationIdentifier_id'
        });*/

        /*var select = models.BibleText.findAll({
            include: [{
                model: models.BibleVers,
                where: whereObj,
                order: 'versNr',
                include: models.BibleBook
            }, {
                model: models.BibleTranslation
            }],
            where: {
                translationIdentifier_id: translations,
                versText: {
                    $like: '%' + req.params.searchString + '%'
                }
            },
            order: 'translationIdentifier_id'
        });*/
        
        return select.then(function(t) {
            return middleware.handleBibleSearch(t, res);
        }).catch(function(e) {
            console.log(e);
            return res.status(500).json(e);
        });
    }
};