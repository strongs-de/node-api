models      = require '../models'

module.exports =
    get: (req, res, next) ->
        # split all translations
        translations = req.params.translations.split ','

        # do the select
        models.BibleText.findAll(
            include: [
                model: models.BibleVers
                where:
                    bookNr_id: parseInt(req.params.bookNumber)
                    chapterNr: parseInt(req.params.chapterNumber)
                order: 'versNr'
            ]
            where:
                translationIdentifier_id: translations
            order: 'translationIdentifier_id'
            ).then (t) ->
                res.send JSON.stringify t
            .catch (e) ->
                res.status(500).send(JSON.stringify e).end()


    search: (req, res, next) ->
        # split all translations
        translations = req.params.translations.split ','

        # build the vers search object
        whereObj = {}
        if req.params.bookNumber?
            whereObj.bookNr_id = parseInt(req.params.bookNumber)
        if req.params.chapterNumber?
            whereObj.chapterNr = parseInt(req.params.chapterNumber)

        # do the select
        models.BibleText.findAll(
            include: [
                model: models.BibleVers
                where: whereObj
                order: 'versNr'
            ]
            where:
                translationIdentifier_id: translations
                versText:
                    $like: '%' + req.params.searchString + '%'
            order: 'translationIdentifier_id'
            ).then (t) ->
                res.send JSON.stringify t
            .catch (e) ->
                res.status(500).send(JSON.stringify e).end()