const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const truckTypeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: null },
}, {
    autocreate: true,
    timestamps: true
});

truckTypeSchema.plugin(mongoosePaginate);
truckTypeSchema.plugin(mongooseAggregatePaginate);


const truckTypes = mongoose.model('trucktypes', truckTypeSchema);
module.exports = truckTypes;
