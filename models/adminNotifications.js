const mongoose = require('mongoose');

const { ObjectId } = require('../helpers/objectIdHelper');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
const mongoosePaginate = require('mongoose-paginate-v2');
const adminModel = require('./admins');
const enumVars = require('../config/enumVariables');

const adminNotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object, default: {} },
    options: { type: Object, default: {} },
    sent: { type: Boolean, default: true },
    isRead: { type: Boolean, default: false },
    type: { type: Number, enum: enumVars.NOTIFICATION_TYPE, required: true },
}, {
    // autoCreate: true,
    timestamps: true,

});

adminNotificationSchema.plugin(mongoosePaginate);
adminNotificationSchema.plugin(mongooseAggregatePaginate);


const adminNotification = mongoose.model('adminnotifications', adminNotificationSchema);
module.exports = adminNotification;
