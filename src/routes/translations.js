var m = require('../middleware/translations');

module.exports = function(app) {
    // Chapter request route
    app.route('/translations').get(m.get);
};
