const mongoose = require('mongoose');
const enumVars = require('../config/enumVariables');
const { NOT_AVAILABLE_TRUCK } = require('../constants/db')
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const holdStatusSchema = new mongoose.Schema({
    truck: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'truck',
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'driver',
        required: false,
    },
    status: {
        type: Number,
        enum: [enumVars.TRUCK_STATUS],
        default: NOT_AVAILABLE_TRUCK,
        required: true,
    },
}, {
    timestamps: true
});

holdStatusSchema.plugin(mongoosePaginate);
holdStatusSchema.plugin(mongooseAggregatePaginate);


const holdStatusModel = mongoose.model('holdstatus', holdStatusSchema);
module.exports = holdStatusModel;
