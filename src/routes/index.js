module.exports = function(app) {
    require('./bible')(app);
    require('./translations')(app);
    require('./strongs')(app);
};
