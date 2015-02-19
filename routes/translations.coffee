m = require '../middleware/translations'

module.exports = (app) ->
    # Chapter request route
    app.route('/bible/get/translations').get m.get;
