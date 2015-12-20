'use strict';

// r           = require 'rethinkdb'
var config      = require('../config');
var sax         = require('sax');
var fs          = require('fs');
var models      = require('../models');

class SequelizeDbWriter {
    writeInDb() {
        return models.sequelize.transaction((t) => {
            this.transaction = t;
            return models.sequelize.sync().then(() => {
                if ((this.bibleObj != null)) {
                    return this.findOrCreateBibleTranslation().then((trans) => {
                        return this.writeBibleBooks(trans);
                    });
                }
            });
        });
    }

    findOrCreateBibleTranslation() {
        return models.BibleTranslation.findOne({where: {identifier: this.bibleObj.identifier}}).then((t) => {
            if (!(typeof t !== "undefined" && t !== null)) {
                t = models.BibleTranslation.create({identifier: this.bibleObj.identifier, language: this.bibleObj.language, name: this.bibleObj.title});
            }
            return t;
        });
    }

    writeBibleBooks(trans) {
        var cnt = fs.readFileSync('./bibles/bibleBooks_de.txt');
        var iterable = (''+cnt).split('\n');
        for (var i = 0, book; i < iterable.length; i++) {
            book = iterable[i];
            this.findOrCreateBibleBook(i + 1, 'de', book);
        }

        return (() => {
            var result = [];
            var iterable1 = this.bibleObj.verses;
            for (var j = 0, vers; j < iterable1.length; j++) {
                vers = iterable1[j];
                result.push(this.findOrCreateVers(trans, vers));
            }
            return result;
        })();
    }

    findOrCreateBibleBook(nr, lang, sBook) {
        var arr = sBook.split(',');
        return models.BibleBook.findOne({where: {nr: nr}}).then((b) => {
            if (!(typeof b !== "undefined" && b !== null)) {
                if (arr.length > 2) { var alternatives = ',' + arr.slice(2).join(',') + ','; }
                b = models.BibleBook.create({nr: nr, name: arr[0], short_name: arr[1], alternativeNames: (typeof alternatives !== "undefined" && alternatives !== null) ? alternatives : '', language: lang});
            }
            return b;
        });
    }

    findOrCreateVers(trans, vers) {
        return models.BibleVers.findOne({where: {bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber}}).then((v, created) => {
            if (!(typeof v !== "undefined" && v !== null)) {
                return models.BibleVers.create({bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber}).then((versObj) => {
                    return versObj;
                });
            }
            return v;
        }).then( (v) => {
            return this.findOrCreateBibleText(trans, v, vers.versText);
        });
    }

    findOrCreateBibleText(tr, dbVers, text) {
        return models.BibleText.findOne({where: {vers_id: dbVers.id, translationIdentifier_id: tr.identifier}}).then((t) => {
            if (!(typeof t !== "undefined" && t !== null)) {
                return models.BibleText.create({vers_id: dbVers.id, translationIdentifier_id: tr.identifier, versText: text});
            }
        });
    }
}



class ZefanjaSaxParser extends SequelizeDbWriter {
    constructor(path) {
        super();
        this.onOpenTag = this.onOpenTag.bind(this);
        this.onText = this.onText.bind(this);
        this.onError = this.onError.bind(this);
        this.baseTagsToStore = ['identifier', 'language', 'title'];
        this.bibleObj = {verses: []};
        var parser = sax.parser(false, {lowercase: true});
        parser.onopentag = this.onOpenTag;
        parser.onerror = this.onError;
        parser.ontext = this.onText;
        var xml = fs.readFileSync(path, 'utf8');
        if ((typeof xml !== "undefined" && xml !== null)) {
            parser.write(xml);
            parser.close();
        } else {
            console.error('Error reading ' + path);
            parser.close();
        }
    }


    onOpenTag(tag) {
        var n = tag.name.toLowerCase();
        var a = tag.attributes;
        if (this.baseTagsToStore.indexOf(n) >= 0) {
            return this.saveTextIn = n;
        } else if (n === 'biblebook') {
            return this.currentBook = parseInt(a.bnumber);
        } else if (n === 'chapter') {
            return this.currentChapter = parseInt(a.cnumber);
        } else if (n === 'vers') {
            this.currentVers = parseInt(a.vnumber);
            return this.saveVersText = true;
        }
    }


    // TODO: we have to get all text within that node
    // e.g. even if there are subnodes in a vers node
    onText(text) {
        if ((this.saveTextIn != null)) {
            this.bibleObj[this.saveTextIn] = text;
        }
        if (this.saveVersText) {
            this.bibleObj.verses.push({
                bookNumber: this.currentBook,
                chapterNumber: this.currentChapter,
                versNumber: this.currentVers,
                versText: text
            });
        }

        // reset
        this.saveTextIn = null;
        return this.saveVersText = false;
    }


    onError(msg) {
        return console.log(msg);
    }
}


var parseAndInsertBibles = function() {
    // test
    var parser = new ZefanjaSaxParser('./bibles/zefanja-xml/GER_LUTH1912.xml');
    parser.writeInDb();
    return;

    var list = fs.readdirSync('./bibles/zefanja-xml');
    return (() => {
        var result = [];
        for (var i = 0, path; i < list.length; i++) {
            path = list[i];
            if (path[0] === '.' || path[-3] === !'xml') {
                continue;
            }
            parser = new ZefanjaSaxParser('./bibles/zefanja-xml/' + path);
            result.push(parser.writeInDb());
        }
        return result;
    })();
};


parseAndInsertBibles();
