const guestAdminRoutes = require('./admin/guestAdminRoutes');
const adminRoutes = require('./admin/adminRoutes');
const userRoutes = require('./admin/userRoutes');
const driverRoutes = require('./admin/driverRoutes');
const truckRoutes = require('./admin/truckRoutes');


module.exports = function (app) {
    app.use('/v1/admin', guestAdminRoutes);
    app.use('/v1/admin/auth', adminRoutes);
    app.use('/v1/admin/users', userRoutes);
    app.use('/v1/admin/drivers', driverRoutes);
    app.use('/v1/admin/trucks', truckRoutes);
};
