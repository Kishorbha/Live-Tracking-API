const mongoose = require('mongoose');

const webSchema = new mongoose.Schema({
    user: { type: 'ObjectId', ref: 'admins', required: true },
    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    expiredAt: { type: Number, default: 0 },
}, {
    // autoCreate: true,
    timestamps: true
});

const webs = mongoose.model('webs', webSchema);
module.exports = webs;