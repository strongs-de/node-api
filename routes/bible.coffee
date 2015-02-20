m = require '../middleware/bible'

module.exports = (app) ->
    # Chapter request route
    app.route('/bible/:translations/:bookNumber/:chapterNumber').get m.get

    # Search requests
    app.route('/search/:translations/:searchString').get m.search
    app.route('/search/:translations/:bookNumber/:searchString').get m.search
    app.route('/search/:translations/:bookNumber/:chapterNumber/:searchString').get m.search
