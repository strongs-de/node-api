models      = require '../models'

module.exports =
    get: (req, res, next) ->
        models.BibleTranslation.findAll().then (t) ->
            res.send JSON.stringify t
        .catch (e) ->
            res.status(500).send(JSON.stringify e).end()
