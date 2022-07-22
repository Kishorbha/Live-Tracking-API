const mongoose = require('mongoose');

let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const { Schema } = mongoose;

const LicenseTypeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' }
})

LicenseTypeSchema.plugin(mongoosePaginate);
LicenseTypeSchema.plugin(mongooseAggregatePaginate);

const licenseTypeModel = mongoose.model('licensetype', LicenseTypeSchema);
export default licenseTypeModel;
