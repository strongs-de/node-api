var models      = require('../models');

module.exports =
    {get(req, res, next) {
        // models.StrongNr.findAll(where: strongNr: req.params.strongNr).then (t) ->
        //     res.status(200).json t
        return models.StrongNr.findAll().then(function(t) {
            return res.status(200).json(t);
        }).catch(function(e) {
            return res.status(500).json(e);
        });
    },

    grammar(req, res, next) {
        // check parameters
        var book = parseInt(req.params.bookNr);
        if (book < 40) {
            return res.status(500).json('ERROR: Could not return grammar details for the old testament!');
        }
        return res.status(200).json('Ok.');
    }
};
