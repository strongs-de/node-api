models      = require '../models'
_           = require 'underscore'

module.exports =
    get: (req, res, next) ->
        # split all translations
        translations = req.params.translations.split ','

        # check parameters
        bookNumber = parseInt(req.params.bookNumber)
        if bookNumber > 66
            return res.status(500).json 'ERROR: Bible book with number ' + bookNumber + ' does not exist!'

        # do the select
        models.BibleText.findAll(
            include: [
                {
                    model: models.BibleVers
                    where:
                        bookNr_id: bookNumber
                        chapterNr: parseInt(req.params.chapterNumber)
                    order: 'versNr'
                    include: models.BibleBook
                }
                {
                    model: models.BibleTranslation
                }
            ]
            where:
                translationIdentifier_id: translations
            order: 'translationIdentifier_id'
            ).then (t) ->
                # if no entry could be found, return status 500 (e.g. wrong chapter number)
                if t.length <= 0
                    return res.status(500).json 'ERROR: Could not find any bible chapter for these parameters!'

                # modify json data
                newT = {}
                t = t.map (item) ->
                    newItem =
                        translation:
                            identifier: item.BibleTranslation.identifier
                            name: item.BibleTranslation.name
                        book:
                            nr: item.BibleVer.BibleBook.nr
                            name: item.BibleVer.BibleBook.name
                            shortName: item.BibleVer.BibleBook.short_name
                        chapter: item.BibleVer.chapterNr
                        vers: item.BibleVer.versNr
                        text: item.versText
                    return newItem
                t = _.groupBy t, (o) -> o.translation.identifier
                newT = {translations: []}
                for prop, val of t
                    newT.translations.push
                        translation: val[0].translation
                        book: val[0].book
                        chapter: val[0].chapter
                        verses: val.map (o) ->
                            versNumber: o.vers
                            text: o.text
                return res.status(200).json newT
            .catch (e) ->
                res.status(500).json e


    search: (req, res, next) ->
        # split all translations
        translations = req.params.translations.split ','

        # build the vers search object
        whereObj = {}
        if req.params.bookNumber?
            whereObj.bookNr_id = bookNumber

            # check parameters
            bookNumber = parseInt(req.params.bookNumber)
            if bookNumber > 66
                return res.status(500).json 'ERROR: Bible book with number ' + bookNumber + ' does not exist!'

        if req.params.chapterNumber?
            whereObj.chapterNr = parseInt(req.params.chapterNumber)

        # do the select
        models.BibleText.findAll(
            include: [
                {
                    model: models.BibleVers
                    where: whereObj
                    order: 'versNr'
                    include: models.BibleBook
                }
                {
                    model: models.BibleTranslation
                }
            ]
            where:
                translationIdentifier_id: translations
                versText:
                    $like: '%' + req.params.searchString + '%'
            order: 'translationIdentifier_id'
            ).then (t) ->
                # modify json data
                if t.length <= 0
                    return res.status(200).json {}
                t = t.map (item) ->
                    newItem =
                        translation:
                            identifier: item.BibleTranslation.identifier
                            name: item.BibleTranslation.name
                        book:
                            nr: item.BibleVer.BibleBook.nr
                            name: item.BibleVer.BibleBook.name
                            shortName: item.BibleVer.BibleBook.short_name
                        chapter: item.BibleVer.chapterNr
                        vers: item.BibleVer.versNr
                        text: item.versText
                    return newItem
                t = _.groupBy t, (o) -> o.translation.identifier
                newT = {translations: []}
                for prop, val of t
                    newT.translations.push
                        translation: val[0].translation
                        # book: val[0].book
                        # chapter: val[0].chapter
                        verses: val.map (o) ->
                            book: o.book
                            chapter: o.chapter
                            versNumber: o.vers
                            text: o.text
                return res.status(200).json newT
            .catch (e) ->
                console.log e
                res.status(500).json e
