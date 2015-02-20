m = require '../middleware/translations'

module.exports = (app) ->
    # Chapter request route
    app.route('/translations').get m.get;
