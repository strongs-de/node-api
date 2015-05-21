models      = require '../models'

module.exports =
    get: (req, res, next) ->
        models.BibleTranslation.findAll().then (t) ->
            res.status(200).json t
        .catch (e) ->
            res.status(500).json e
