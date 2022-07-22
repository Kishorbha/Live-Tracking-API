const mongoose = require('mongoose');
const enumVars = require('../config/enumVariables');
const moment = require('moment');
const apiMessage = require('../constants/lang');
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const pageSchema = new mongoose.Schema({
    pageType: { type: String, enum: enumVars.pageType },
    title: { type: String, required: true },
    content: { type: String, default: null },
    status: { type: Boolean, default: true },
    editable: { type: Boolean, default: true },
}, {
    timestamps: true
});

pageSchema.plugin(mongoosePaginate);
pageSchema.plugin(mongooseAggregatePaginate);

pageSchema.statics.updatePage = async function (pageId, data) {

    return await this.updateOne({ _id: pageId }, data).exec();
};


const pages = mongoose.model('pages', pageSchema);
module.exports = pages;
