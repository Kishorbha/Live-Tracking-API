const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const boxTruckTypeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: null },
}, {
    autocreate: true,
    timestamps: true
});

boxTruckTypeSchema.plugin(mongoosePaginate);
boxTruckTypeSchema.plugin(mongooseAggregatePaginate);


const boxTruckTypes = mongoose.model('boxtrucktypes', boxTruckTypeSchema);
module.exports = boxTruckTypes;
