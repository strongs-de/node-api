m = require '../middleware/todo'

module.exports = (app) ->
    # Define the todo routes
    app.route('/todo/get').get m.get;                # Retrieve all the todos
    app.route('/todo/new').put m.create;             # Create a new todo
    app.route('/todo/update').post m.update;         # Update a todo
    app.route('/todo/delete').post m.del;            # Delete a todo
