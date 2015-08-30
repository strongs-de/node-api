# r           = require 'rethinkdb'
config      = require '../config'
sax         = require 'sax'
fs          = require 'fs'
models      = require '../models'

class SequelizeDbWriter
    writeInDb: () ->
        models.sequelize.transaction (t) =>
            @transaction = t
            models.sequelize.sync().then () =>
                if @bibleObj?
                    @findOrCreateBibleTranslation().then (trans) =>
                        @writeBibleBooks(trans)

    findOrCreateBibleTranslation: () ->
        return models.BibleTranslation.findOne(where: identifier: @bibleObj.identifier).then (t) =>
            if not t?
                t = models.BibleTranslation.create identifier: @bibleObj.identifier, language: @bibleObj.language, name: @bibleObj.title
            return t

    writeBibleBooks: (trans) ->
        cnt = fs.readFileSync './bibles/bibleBooks_de.txt'
        for book, i in (''+cnt).split '\n'
            @findOrCreateBibleBook(i + 1, 'de', book)

        for vers in @bibleObj.verses
            @findOrCreateVers trans, vers

    findOrCreateBibleBook: (nr, lang, sBook) ->
        arr = sBook.split ','
        return models.BibleBook.findOne(where: nr: nr).then (b) =>
            if not b?
                alternatives = ',' + arr[2..].join(',') + ',' if arr.length > 2
                b = models.BibleBook.create nr: nr, name: arr[0], short_name: arr[1], alternativeNames: alternatives ? '', language: lang
            return b

    findOrCreateVers: (trans, vers) ->
        return models.BibleVers.findOne(where: bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber).then (v, created) =>
            if not v?
                return models.BibleVers.create(bookNr_id: vers.bookNumber, chapterNr: vers.chapterNumber, versNr: vers.versNumber).then (versObj) =>
                    return versObj
            return v
        .then (v) =>
            @findOrCreateBibleText trans, v, vers.versText

    findOrCreateBibleText: (tr, dbVers, text) ->
        models.BibleText.findOne(where: vers_id: dbVers.id, translationIdentifier_id: tr.identifier).then (t) =>
            if not t?
                models.BibleText.create vers_id: dbVers.id, translationIdentifier_id: tr.identifier, versText: text



class ZefanjaSaxParser extends SequelizeDbWriter
    constructor: (path) ->
        @baseTagsToStore = ['identifier', 'language', 'title']
        @bibleObj = {verses: []}
        parser = sax.parser false, lowercase: true
        parser.onopentag = @onOpenTag
        parser.onerror = @onError
        parser.ontext = @onText
        xml = fs.readFileSync path, 'utf8'
        if xml?
            parser.write xml
            parser.close()
        else
            console.error 'Error reading ' + path
            parser.close()


    onOpenTag: (tag) =>
        n = tag.name.toLowerCase()
        a = tag.attributes
        if n in @baseTagsToStore
            @saveTextIn = n
        else if n is 'biblebook'
            @currentBook = parseInt(a.bnumber)
        else if n is 'chapter'
            @currentChapter = parseInt(a.cnumber)
        else if n is 'vers'
            @currentVers = parseInt(a.vnumber)
            @saveVersText = true


    # TODO: we have to get all text within that node
    # e.g. even if there are subnodes in a vers node
    onText: (text) =>
        if @saveTextIn?
            @bibleObj[@saveTextIn] = text
        if @saveVersText
            @bibleObj.verses.push
                # translation:
                #     identifier: @bibleObj.identifier
                #     title: @bibleObj.title
                #     language: @bibleObj.language
                bookNumber: @currentBook
                chapterNumber: @currentChapter
                versNumber: @currentVers
                versText: text

        # reset
        @saveTextIn = null
        @saveVersText = false


    onError: (msg) =>
        console.log msg


parseAndInsertBibles = () ->
    # test
    parser = new ZefanjaSaxParser './bibles/zefanja-xml/GER_LUTH1912.xml'
    parser.writeInDb()
    return

    list = fs.readdirSync './bibles/zefanja-xml'
    for path in list
        if path[0] is '.' or path[-3] is not 'xml'
            continue
        parser = new ZefanjaSaxParser './bibles/zefanja-xml/' + path
        parser.writeInDb()


parseAndInsertBibles()
