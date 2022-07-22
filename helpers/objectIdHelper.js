const MongoDbObjectId = require('mongoose').Types.ObjectId;
module.exports = {
    ObjectId: function (stringId) {
        return MongoDbObjectId(stringId)
    },


};