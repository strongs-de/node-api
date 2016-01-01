'use strict';

// r           = require 'rethinkdb'
//var config      = require('../config');
var fs          = require('fs');
var models      = require('../models');
// var parseString = require('xml2js').parseString;
var Parser      = require('xml2js').Parser;
var Sequelize   = require('sequelize');
var ProgressBar = require('progress');

class BibleObject {
    constructor(bibleName, identifier, language) {
        this.title = bibleName;
        this.identifier = identifier;
        this.verses = [];
        if(language == null) {
            language = 'de';
        }
        this.language = language;
    }
}

class VersObject {
    constructor(bookNr, chapterNr, versNr) {
        this.sequences = [];
        this.bookNumber = bookNr;
        this.chapterNumber = chapterNr;
        this.versNumber = versNr;
    }
}

class SequelizeDbWriter {
    constructor(bibleObject, progressBar) {
        this.bar = progressBar;
        if(!arguments.length)
            this.bibleObj = new BibleObject();
        else
            this.bibleObj = bibleObject;
    }
    
    writeInDb() {
        return models.sequelize.transaction({
            isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
            autocommit: false
        }, (t) => {
            this.transaction = t;
            return models.sequelize.sync().then(() => {
                console.log('synced db');
                if ((this.bibleObj != null)) {
                    return this.findOrCreateBibleTranslation().then((trans) => {
                        return this.writeBibleBooks(trans);
                    });
                }
            });
        });
    }
    
    writeInDb2() {
        var t = undefined;
        var _this = this;
        return models.sequelize.sync().then(() => {
            // first create bible books
            var cnt = fs.readFileSync('./bibles/bibleBooks_de.txt');
            var books = (''+cnt).split('\n');
            var promises = [];
            for (var i = 0, book; i < books.length; i++) {
                book = books[i];
                promises.push(this.findOrCreateBibleBook(i + 1, 'de', book));
            }
            return Sequelize.Promise.all(promises).then(() => {
                return this.findOrCreateBibleTranslation().then((trans) => {
                    return Sequelize.Promise.map(this.bibleObj.verses, (vers) => {
                        _this.bar.tick({'biblebook': vers.bookNumber});
                        return models.BibleVers.findOne({transaction: t, where: {bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber}}).then((v) => {
                            if (!(typeof v !== 'undefined' && v !== null)) {
                                return models.BibleVers.create({bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber}, {transaction: t}).then((versObj) => {
                                    return versObj;
                                });
                            }
                            return v;
                        }).then((v) => {
                            return models.BibleSequence.findOne({transaction: t, where: {vers_id: v.id, translationIdentifier_id: trans.identifier}}).then((dbSeq) => {
                                if (!(typeof dbSeq !== 'undefined' && dbSeq !== null)) {
                                    return Sequelize.Promise.map(vers.sequences, (seq) => {
                                        return models.BibleSequence.create({
                                            vers_id: v.id, 
                                            translationIdentifier_id: trans.identifier, 
                                            sequenceText: seq.sequenceText, 
                                            sequenceOrder: seq.sequenceIndex, 
                                            strongNumber: seq.strongNumber,
                                            grammar: seq.grammar},
                                            {transaction: t});
                                    });
                                }
                            });
                        });
                    }, {concurrency: 50});
                });
            });
        });
    }
    /*
    writeInDb3() {
        /*return models.sequelize.transaction().then((t) => {
            //t = undefined;
            this.transaction = t;* /
        var t = undefined;
        return models.sequelize.sync().then(() => {
            // first create bible books
            var cnt = fs.readFileSync('./bibles/bibleBooks_de.txt');
            var books = (''+cnt).split('\n');
            var promises = [];
            for (var i = 0, book; i < books.length; i++) {
                book = books[i];
                promises.push(this.createBibleBook(i + 1, 'de', book));
            }
            return Sequelize.Promise.all(promises).then(() => {
                return this.createBibleTranslation().then((trans) => {
                    return Sequelize.Promise.map(this.bibleObj.verses, (vers) => {
                        return models.BibleVers.create({bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber}, {transaction: t}).then((v) => {
                            return Sequelize.Promise.map(vers.sequences, (seq) => {
                                return models.BibleSequence.create({
                                    vers_id: v.id, 
                                    translationIdentifier_id: trans.identifier, 
                                    sequenceText: seq.sequenceText, 
                                    sequenceOrder: seq.sequenceIndex, 
                                    strongNumber: seq.strongNumber,
                                    grammar: seq.grammar},
                                    {transaction: t});
                            });
                        });
                    }, {concurrency: 8});
                });
            });
            //});
        }).then(() => {
            console.log('we are done!');
        });
    }*/

    findOrCreateBibleTranslation() {
        //console.log('create translation ...');
        return models.BibleTranslation.findOne({transaction: this.transaction, where: {identifier: this.bibleObj.identifier}}).then((t) => {
            //console.log('translation select done');
            if (!(typeof t !== 'undefined' && t !== null)) {
                //console.log('create translation');
                t = models.BibleTranslation.create({identifier: this.bibleObj.identifier, language: this.bibleObj.language, name: this.bibleObj.title}, {transaction: this.transaction});
            }
            return t;
        });
    }
/*
    createBibleTranslation() {
        //console.log('create translation ...');
        return models.BibleTranslation.create({
            identifier: this.bibleObj.identifier, 
            language: this.bibleObj.language, 
            name: this.bibleObj.title}, 
            {transaction: this.transaction});
    }
*/
    writeBibleBooks(trans) {
        console.log('write bible books ...');
        var cnt = fs.readFileSync('./bibles/bibleBooks_de.txt');
        var iterable = (''+cnt).split('\n');
        var promises = [];
        for (var i = 0, book; i < iterable.length; i++) {
            book = iterable[i];
            promises.push(this.findOrCreateBibleBook(i + 1, 'de', book));
        }
        
        return Sequelize.Promise.all(promises).then(function() {
            promises = [];
            var verses = this.bibleObj.verses;
            for (var j = 0, vers; j < verses.length; j++) {
                vers = verses[j];
                promises.push(this.findOrCreateVers(trans, vers));
            }
            return Sequelize.Promise.all(promises);
        });
    }

    findOrCreateBibleBook(nr, lang, sBook) {
        //console.log('findOrCreateBibleBook ' + sBook);
        var arr = sBook.split(',');
        return models.BibleBook.findOne({transaction: this.transaction, where: {nr: nr}}).then((b) => {
            if (!(typeof b !== 'undefined' && b !== null)) {
                if (arr.length > 2) { var alternatives = ',' + arr.slice(2).join(',') + ','; }
                b = models.BibleBook.create({nr: nr, name: arr[0], short_name: arr[1], alternativeNames: (typeof alternatives !== 'undefined' && alternatives !== null) ? alternatives : '', language: lang}, {transaction: this.transaction});
            }
            return b;
        });
    }
/*
    createBibleBook(nr, lang, sBook) {
        console.log('createBibleBook ' + sBook);
        var arr = sBook.split(',');
        return models.BibleBook.create({
            nr: nr, 
            name: arr[0], 
            short_name: arr[1], 
            alternativeNames: (typeof alternatives !== 'undefined' && alternatives !== null) ? alternatives : '', 
            language: lang}, 
            {transaction: this.transaction});
    }

    findOrCreateVers(trans, vers) {
        console.log('findOrCreateVers ' + vers.bookNumber + ',' + vers.chapterNumber + ',' + vers.versNumber);
        return models.BibleVers.findOne({where: {bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber}}).then((v, created) => {
            if (!(typeof v !== 'undefined' && v !== null)) {
                return models.BibleVers.create({bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber}).then((versObj) => {
                    return versObj;
                });
            }
            return v;
        }).then((v) => {
            console.log('done creating vers ' + v.bookNumber + ',' + v.chapterNumber + ',' + v.versNumber);
            return this.findOrCreateBibleText(trans, v, vers);
        });
    }

    findOrCreateBibleText(tr, dbVers, versObj) {
        console.log('findOrCreateBibleText ' + versObj.bookNumber + ',' + versObj.chapterNumber + ',' + versObj.versNumber);
        return models.BibleSequence.findOne({where: {vers_id: dbVers.id, translationIdentifier_id: tr.identifier}}).then((t) => {
            if (!(typeof t !== 'undefined' && t !== null)) {
                return versObj.sequences.forEach(function(seq) {
                    models.BibleSequence.create({
                        vers_id: dbVers.id, 
                        translationIdentifier_id: tr.identifier, 
                        sequenceText: seq.sequenceText, 
                        sequenceOrder: seq.sequenceNumber, 
                        strongNr: seq.strongNumber});
                });
            }
        });
    }*/
}


var parseAndInsertBibles = function() {
    var file = './bibles/zefanja-xml/GER_ELB1905_STRONG.xml';
    if(process.argv.length > 2)
        file = process.argv[2];
    var xml = fs.readFileSync(file, 'utf8');
    var parser = new Parser({explicitChildren: true, charsAsChildren: true, preserveChildrenOrder: true});
    parser.parseString(xml, function (err, result) {
        if(err == null) {
            try {
                var bibleObj = new BibleObject(result.XMLBIBLE.$.biblename, result.XMLBIBLE.INFORMATION[0].identifier[0]._);
                console.log('start parsing ' + bibleObj.title + ' ...');
                
                // walk through bible books
                result.XMLBIBLE.BIBLEBOOK.forEach(function(book) {
                    var bookNr = book.$.bnumber;
                    //console.log(' book number ' + bookNr);
                    
                    // walk through chapters
                    book.CHAPTER.forEach(function(chapter) {
                        var chapterNr = chapter.$.cnumber;
                        //console.log('  chapter number ' + chapterNr);
                        
                        // walk through verses
                        chapter.VERS.forEach(function(vers) {
                            var versObj = new VersObject(bookNr, chapterNr, vers.$.vnumber);
                            
                            // walk through vers children (words or gr tags with strong numbers)
                            var sequenceIdx = 0;
                            if(vers.$$ !== undefined) {
                                var sequenceText = '';
                                vers.$$.forEach(function(sequence) {
                                    var text = sequence._;
                                    var strongNr = undefined;
                                    if(sequence['#name'] == 'gr') {
                                        strongNr = sequence.$.str;
                                        var grammar = sequence.$.rmac;
                                        
                                        // write the sequence text before this strong number into versObj
                                        if(sequenceText !== '') {
                                            versObj.sequences.push({
                                                sequenceIndex: sequenceIdx++,
                                                sequenceText: sequenceText,
                                                strongNumber: undefined,
                                                grammar: undefined
                                            });
                                        }
                                        
                                        // write the new sequence (with strong number) into versObj
                                        versObj.sequences.push({
                                            sequenceIndex: sequenceIdx++,
                                            sequenceText: text,
                                            strongNumber: strongNr,
                                            grammar: grammar
                                        });
                                        sequenceText = '';
                                    } else {
                                        sequenceText += text;
                                    }
                                });
                                
                                // write the old sequenceText (if any) into versObj)
                                if(sequenceText !== '') {
                                    versObj.sequences.push({
                                        sequenceIndex: sequenceIdx++,
                                        sequenceText: sequenceText,
                                        strongNumber: undefined,
                                        grammar: undefined
                                    });
                                }
                                bibleObj.verses.push(versObj);
                            } else {
                                console.log('no children found for bookNr ', bookNr, ' chapter ', chapterNr, ' vers ', vers.$.vnumber);
                                console.dir(vers);
                            }
                        }, this);
                    }, this);
                }, this);
                
                console.log('done parsing!');
                
                // write in db
                var bar = new ProgressBar(':percent, :elapsed s, current book: :biblebook :bar :current / :total verses', { total: bibleObj.verses.length });
                var writer = new SequelizeDbWriter(bibleObj, bar);
                //console.log('created writer');
                writer.writeInDb2().then(function(t) {
                    console.log('done writing to database!');
                });
            } catch(e) {
                console.dir(e);
            }
        } else {
            // TODO
        }
    });
};


parseAndInsertBibles();
