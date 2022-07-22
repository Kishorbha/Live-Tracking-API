
require('dotenv').config();
const uuidv1 = require('uuid/v1');
const { SUCCESS, FORGOT_PASSWORD, RESET_PASSWORD, UNAUTHORIZED, LOGIN, REGISTER, LOG_OUT } = require('../../../constants/lang');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { signAccessToken, signRefreshToken } = require('../../../modules/jwtToken');
const { JWT_REFRESH_TOKEN_SECRET } = require('../../../config');
const controller = require('../../controller');
const adminModel = require('../../../models/admins')
const webModel = require('../../../models/webs');
const adminpermissionModel = require('../../../models/adminPermissions')
const { getCodeContactNumber } = require('../../../repositories/contactRepository');
const { ObjectId } = require('../../../helpers/objectIdHelper');
class guestAdminController extends controller {

    async register(req, res, next) {
        let { firstName, lastName, email, userName, password, role, status, phoneCode, countryCode, contactNumber } = req.body;

        let createUserObj = {
            fullName: firstName + ' ' + lastName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            userName: userName,
            password: password,
            role: role,
            status: status,
            phoneCode: phoneCode,
            countryCode: countryCode,
            contactNumber: contactNumber,
            codeContactNumber: getCodeContactNumber(phoneCode, contactNumber)
        };

        const createUser = new adminModel(createUserObj);
        const userResponse = await createUser.save();

        const { accessToken } = await signAccessToken(userResponse._id);

        res.status(REGISTER.REGISTER_SUCCESS.httpCode).json({
            message: REGISTER.REGISTER_SUCCESS.message,
            data: userResponse,
            accessToken
        });
    }

    async signIn(req, res, next) {
        try {

            const user = req.user;

            const { accessToken, expiresIn } = await signAccessToken(user._id);
            const refreshToken = await signRefreshToken(user._id);

            await webModel.findOneAndUpdate({
                user: ObjectId(user._id)
            }, {
                $set: {
                    accessToken: accessToken,
                    user: user._id,
                    refreshToken: refreshToken,
                    expiredAt: expiresIn
                }
            }, {
                upsert: true,
                new: false,
                useFindAndModify: false,
            })

            let profile = await adminModel.profileById(user._id);
            let roles = await adminpermissionModel.find({
                role: req.user.role
            }, { module: 1, permit: 1, _id: 0 })

            res.set('accessToken', accessToken);
            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: {
                    role: profile.role,
                    tokenData: {
                        accessToken,
                    },
                    roles: roles
                }
            });
        } catch (e) {
            console.log("error", e)
            next(e);
        }
    }

    async refreshAccessToken(req, res, next) {
        try {
            const refreshToken = req.get('refreshToken');


            let userId = null;//oldDevice.user;
            let httpCode = UNAUTHORIZED.httpCode;
            let httpMessage = UNAUTHORIZED.message;
            // verify refresh token to check if it was issued
            const ok = await jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET, async function (err, decoded) {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        httpMessage = LOGIN.TOKEN_EXPIRED.message;
                        httpCode = LOGIN.TOKEN_EXPIRED.httpCode;
                        return false;
                    }

                    httpMessage = err.message;
                    httpCode = 500;
                    return false;
                }

                userId = decoded.sub;
                return true;
            });

            if (ok) {
                const {
                    accessToken,
                    expiresIn
                } = await signAccessToken(userId);
                // await oldDevice.updateOne({
                //     accessToken,
                //     expiredAt: expiresIn
                // }, {
                //     new: false
                // }).exec();

                let profile = await profileById(userId);
                try {
                    profile = profile.toObject();
                } catch (e) { }
                res.set('accessToken', accessToken);
                res.set('refreshToken', refreshToken);
                res.set('expiresIn', expiresIn);
                res.status(SUCCESS.httpCode).json({
                    message: SUCCESS.message,
                    data: {
                        ...profile,
                        tokenData: {
                            accessToken,
                            refreshToken,
                            expiresIn
                        }
                    }
                });
            } else {
                res.status(httpCode).json({
                    message: httpMessage,
                    data: {}
                });
            }

        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        const session = await mongoose.startSession();
        session.startTransaction();
        let Err;

        try {
            const passwordToken = await uuidv1();
            let { email } = req.body;

            if (!passwordToken) {
                throw new Error('Unable to generate reset link.');
            }

            const user = await adminModel.findOne({ email }).exec();
            if (!user) {
                Err = new Error(FORGOT_PASSWORD.EMAIL_NOT_FOUND.message);
                Err.status = FORGOT_PASSWORD.EMAIL_NOT_FOUND.httpCode;
                return next(Err);
            }

            const passwordTokenExpiry = new Date().setDate(new Date().getDate() + 1);//24 hours validity
            await adminModel.updateOne(
                { _id: user._id },
                { $set: { passwordToken, passwordTokenExpiry } }
            ).exec();

            let reset_link = process.env.SITE_APP_URL + "/reset/" + passwordToken;
            // let reset_link = "http://localhost:8080/reset/" + passwordToken;
            reset_link = reset_link.replace(/([^:]\/)\/+/g, "$1");

            let emailObj = {
                emailTo: 'niroj.ebpearls@gmail.com',//user.email,
                subject: 'Forgot Password',
                templateName: 'resetPasswordTemplate',
                emailObjVariables: {
                    userName: user.firstName,
                    reset_link: reset_link,
                }
            };
            await emailModule.triggerEmail(emailObj);

            await session.commitTransaction();
            session.endSession();
            res.status(FORGOT_PASSWORD.SUCCESS.httpCode).json({
                message: FORGOT_PASSWORD.SUCCESS.message,
                data: {}
            });
        } catch (e) {
            await session.abortTransaction();
            session.endSession();
            next(e)
        }
    }

    async verifyReset(req, res, next) {
        try {
            const { token } = req.body;

            const user = await adminModel.findOne({ passwordToken: token }).exec();

            if (!user) {
                let Err = new Error(RESET_PASSWORD.INVALID_TOKEN.message);
                Err.status = RESET_PASSWORD.INVALID_TOKEN.httpCode;
                return next(Err);
            }

            if (user.hasOwnProperty('passwordTokenExpiry') && user.passwordTokenExpiry < new Date().getTime()) {
                let Err = new Error(RESET_PASSWORD.EXPIRED_LINK.message);
                Err.status = RESET_PASSWORD.EXPIRED_LINK.httpCode;
                return next(Err);
            }

            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: {}
            });
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            let { newPassword, passwordToken } = req.body;

            const user = await adminModel.findOne({ passwordToken }).exec();

            if (!user) {
                let Err = new Error(RESET_PASSWORD.INVALID_TOKEN.message);
                Err.status = RESET_PASSWORD.INVALID_TOKEN.httpCode;
                return next(Err);
            }

            if (user.hasOwnProperty('passwordTokenExpiry') && user.passwordTokenExpiry < new Date().getTime()) {
                let Err = new Error(RESET_PASSWORD.EXPIRED_LINK.message);
                Err.status = RESET_PASSWORD.EXPIRED_LINK.httpCode;
                return next(Err);
            }

            let isSame = await user.isValidPassword(newPassword);
            if (isSame) {
                let Err = new Error(RESET_PASSWORD.SAME_PASSWORD.message);
                Err.status = RESET_PASSWORD.SAME_PASSWORD.httpCode;
                return next(Err);
            }

            const password = await adminModel.generatePassword(newPassword);
            passwordToken = '';
            await adminModel.updateOne(
                { _id: user._id },
                { $set: { password, passwordToken } }
            ).exec();

            res.status(RESET_PASSWORD.SUCCESS.httpCode).json({
                message: RESET_PASSWORD.SUCCESS.message,
                data: {}
            });
        } catch (e) {
            next(e);
        }
    }

    async showResetPassword(req, res, next) {
        try {
            const { passwordToken } = req.params;

            const user = await adminModel.findOne({ passwordToken }).exec();

            let data = { user };
            if (!user) {
                data.error = RESET_PASSWORD.INVALID_TOKEN.message;
            }

            if (user && user.hasOwnProperty('passwordTokenExpiry') && user.passwordTokenExpiry < new Date().getTime()) {
                data.error = RESET_PASSWORD.EXPIRED_LINK.message;
            }

            res.render('auth/resetPassword', data);
        } catch (e) {
            next(e);
        }
    }

    async logOut(req, res, next) {
        try {

            const { accessToken } = req.body;
            const user = req.user;

            const webObj = await webModel.findOne({ user: user._id, accessToken: accessToken });

            if (!webObj) {
                let Err = new Error(LOG_OUT.ACCESS_TOKEN_NOT_FOUND.message);
                Err.status = LOG_OUT.ACCESS_TOKEN_NOT_FOUND.httpCode;
                return next(Err);
            }

            await webModel.findOneAndDelete({ user: user._id, accessToken }).exec();

            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: {}
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports.guestAdminController = guestAdminController;
module.exports.instance = new guestAdminController();
