const AccessControl = require("accesscontrol");
const grantPermissionModel = require('../models/grantPermissions');
const ac = new AccessControl();


exports.grants = (async function (loggedUser) {
    let grantPermission = await grantPermissionModel.aggregate([
        {
            $match: {
                status: true
            },
        },
        {
            $project: {
                permits: 1,
            }
        }
    ])
    let grantObj = grantPermission.pop() || null

    let ac1 = new AccessControl(grantObj.permits);

    ac1.setGrants(grantObj.permits);
    return ac1
});

// TODO: After Fetch Remove this
exports.roles = (function () {
    ac.grant("hr")
        .readOwn("profile")
        .updateOwn("profile")

    ac.grant("dispatcher")
        .readAny("profile")

    ac.grant("admin")
        .extend("hr")
        .extend("dispatcher")
        .updateAny("profile")
        .deleteAny("profile")
        .createAny('profile')
    return ac;
})();