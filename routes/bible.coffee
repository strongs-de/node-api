m = require '../middleware/bible'

module.exports = (app) ->
    # Chapter request route
    app.route('/bible/get/:translations/:bookNumber/:chapterNumber').get m.get

    # Search requests
    app.route('/bible/search/:translations/:searchString').get m.search
    app.route('/bible/search/:translations/:bookNumber/:searchString').get m.search
    app.route('/bible/search/:translations/:bookNumber/:chapterNumber/:searchString').get m.search
