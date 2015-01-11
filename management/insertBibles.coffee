r       = require 'rethinkdb'
config  = require '../config'
sax     = require 'sax'
fs      = require 'fs'

class BibleSaxParser
    writeInDb: () =>
        if @bibleObj?
            r.connect config.rethinkdb, (error, conn) =>
                if error
                    console.error error
                    return

                console.log 'writing %s in db ...',
                    @bibleObj.title

                for v in @bibleObj.verses
                    r.table('bible').insert(v).run conn, (err, result) =>
                        if err?
                            console.error err
                            return


class ZefanjaSaxParser extends BibleSaxParser
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


    # todo: we have to get all text within that node
    # e.g. even if there are subnodes in a vers node
    onText: (text) =>
        if @saveTextIn?
            @bibleObj[@saveTextIn] = text
        if @saveVersText
            @bibleObj.verses.push
                translation:
                    identifier: @bibleObj.identifier
                    title: @bibleObj.title
                    language: @bibleObj.language
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
    list = fs.readdirSync './bibles/zefanja-xml'
    for path in list
        if path[0] is '.'
            continue
        parser = new ZefanjaSaxParser './bibles/zefanja-xml/' + path
        parser.writeInDb()


parseAndInsertBibles()