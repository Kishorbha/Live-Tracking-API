// const {profileById} = require("../../../repositories/v2/userRepository");

require('dotenv').config();
const adminModel = require('../../../models/admins');
const webModel = require('../../../models/webs');
const { SUCCESS, CHANGE_PASSWORD, LOG_OUT } = require('../../../constants/lang');
const controller = require('../../controller');

class adminController extends controller {


    async profile(req, res, next) {
        try {
            const user = req.user;
            // let profile = await profileById(user._id);

            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: profile
            });
        } catch (e) {
            next(e);

        }
    }


    async changePassword(req, res, next) {
        try {
            let { newPassword, currentPassword } = req.body;
            const user = req.user;
            let isValidPassword = await user.isValidPassword(currentPassword);
            if (!isValidPassword) {
                let Err = new Error(CHANGE_PASSWORD.OLD_PASSWORD_MISMATCH.message);
                Err.status = CHANGE_PASSWORD.OLD_PASSWORD_MISMATCH.httpCode;
                return next(Err);
            }

            let password = await adminModel.generatePassword(newPassword);

            await adminModel.updateOne(
                { _id: user._id },
                { $set: { password } }
            ).exec();

            res.status(CHANGE_PASSWORD.SUCCESS.httpCode).json({
                message: CHANGE_PASSWORD.SUCCESS.message,
                data: {}
            });
        }
        catch (e) {
            next(e);
        }
    }


}

module.exports.adminController = adminController
module.exports.instance = new adminController();
