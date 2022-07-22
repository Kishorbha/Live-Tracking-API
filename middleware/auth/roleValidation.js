const { roles, grants } = require('../role')
const adminPermissionModel = require('../../models/adminPermissions');

module.exports = {
    grantAccess: function (action, resource) {
        return async (req, res, next) => {
            try {
                const permission = roles.can(req.user.role)[action](resource);
                if (!permission.granted) {
                    return res.status(401).json({
                        error: "You don't have enough permission to perform this action"
                    });
                }
                next()
            } catch (error) {
                next(error)
            }
        }
    },

    setModuleAction: (module, action) => {
        return (req, res, next) => {
            req.module = module;
            req.action = action;

            return next();
        }
    },

    accessDenied: () => {
        const Err = new Error('Access Denied');
        Err.code = Err.status = 403;
        Err.message = 'Access Denied.';
        return Err;
    },

    checkPermission: (action, resource) => {
        return async (req, res, next) => {
            const loggedUser = req.user;
            let grantsAccessControl = await grants();

            // let adminPermission = await adminPermissionModel.aggregate([
            //     {
            //         $match: {
            //             "role": loggedUser.role,
            //             "module": req.module,
            //             "permit.action": req.action
            //         },
            //     },
            //     {
            //         $project: {
            //             module: 1,
            //             permit: 1,
            //         }
            //     }
            // ])

            // let admissionPermissionObj = adminPermission.pop() || null
            // let selectSpecificActionAvailableToUser = admissionPermissionObj.permit.find((obj) => obj.action === req.action)

            const permission = grantsAccessControl.can(loggedUser.role)[action](resource)

            if (!permission.granted) {
                return res.status(403).json({
                    error: "You don't have enough permission to perform this action"
                });
            }

            return next();
        }
    },
}
