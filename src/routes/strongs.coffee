m = require '../middleware/strongs'

module.exports = (app) ->
    # Chapter request route
    app.route('/strong/:strongNr').get m.get;
    app.route('/strong/:translation/:bookNr(\\d+)/:chapterNrr(\\d+)/:versNrr(\\d+)/:strongNr').get m.grammar
