const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

const grantPermissionSchema = new mongoose.Schema({
    permits: [{
        role: { type: String },
        resource: { type: String },
        action: { type: String },
        attributes: { type: String },
    }],
    status: { type: Boolean, default: true },
},
    {
        autocreate: true,
        timestamp: true
    }
);

const grantPermissionModel = mongoose.model('grantpermissions', grantPermissionSchema);
module.exports = grantPermissionModel;
