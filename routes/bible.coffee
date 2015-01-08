m = require '../middleware/bible'

module.exports = (app) ->
    # Define the todo routes
    app.route('/bible/get/:translations/:key').get m.get;         # Retrieve one chapter
