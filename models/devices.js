const mongoose = require('mongoose');
const schema = mongoose.Schema;

const deviceSchema = new schema({
    driverId: { type: 'ObjectId', ref: 'driver', required: true },
    deviceId: { type: String, unique: true, required: true },
    registrationToken: { type: String, default: null }, // used for push notification
}, {
    // autoCreate: true,
    timestamps: true
});


const deviceModel = mongoose.model('devices', deviceSchema);

module.exports = deviceModel;
