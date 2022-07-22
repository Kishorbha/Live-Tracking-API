const driverRoutes = require('./api/driverRoutes');


module.exports = function (app) {
    app.use('/v1/api/driver', driverRoutes);
};
