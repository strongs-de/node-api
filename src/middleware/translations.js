var models      = require('../models');

module.exports =
    {get(req, res, next) {
        return models.BibleTranslation.findAll().then(function(t) {
            return res.status(200).json(t);
        }).catch(function(e) {
            return res.status(500).json(e);
        });
    }
};