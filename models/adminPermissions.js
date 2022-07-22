const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

const adminPermissionSchema = new mongoose.Schema({
    role: { type: String },
    description: { type: String },
    module: { type: String },
    permit: [],
},
    {
        autocreate: true,
        timestamp: true
    }
);

const adminPermission = mongoose.model('adminpermissions', adminPermissionSchema);
module.exports = adminPermission;