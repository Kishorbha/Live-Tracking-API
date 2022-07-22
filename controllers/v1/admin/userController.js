
require('dotenv').config();
const controller = require('../../controller');
const adminModel = require('../../../models/admins')
const webModel = require('../../../models/webs');
const { REGISTER, SUCCESS, USER } = require('../../../constants/lang');
const { getCodeContactNumber } = require('../../../repositories/contactRepository');
const { ObjectId } = require('../../../helpers/objectIdHelper');
const awsService = require('../../../modules/awsService');
const imageService = require('../../../modules/imageService');
const { last } = require('lodash');

class userController extends controller {

    async createNewUser(req, res, next) {
        let { firstName, lastName, email, userName, password, role, status, phoneCode, countryCode, contactNumber } = req.body;

        let createUserObj = {
            fullName: firstName + ' ' + lastName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            firstName: firstName,
            lastName: lastName,
            userName: userName,
            password: password,
            role: role,
            status: status,
            phoneCode: phoneCode,
            countryCode: countryCode,
            contactNumber: contactNumber,
            codeContactNumber: getCodeContactNumber(phoneCode, contactNumber)
        };

        if (role === 'admin') {
            let Err = new Error(REGISTER.FORBIDDEN_USER_ROLE.message);
            Err.status = REGISTER.FORBIDDEN_USER_ROLE.httpCode;
            return next(Err);
        }

        // const UserEmailExits = await adminModel.findOne({ email: email });
        const UserEmailUserNameExists = await adminModel.findOne({ $or: [{ email: email }, { userName: userName }, { contactNumber: contactNumber }] });


        if (UserEmailUserNameExists) {
            let Err = new Error(USER.EMAIL_USERNAME_CONTACT_NUMBER_ALREADY_EXISTS.message);
            Err.status = USER.EMAIL_USERNAME_CONTACT_NUMBER_ALREADY_EXISTS.httpCode;
            return next(Err);
        }

        const createUser = new adminModel(createUserObj);
        const userResponse = await createUser.save();

        res.status(REGISTER.REGISTER_SUCCESS.httpCode).json({
            message: REGISTER.REGISTER_SUCCESS.message,
            data: userResponse,
        });
    }

    async updateUser(req, res, next) {

        let { firstName, lastName, email, userName, password, role, status, phoneCode, countryCode, contactNumber } = req.body;
        let adminUser = await adminModel.findOne(
            {
                _id: ObjectId(req.params.userId)
            }
        );
        if (adminUser.role === 'admin') {
            let Err = new Error(REGISTER.FORBIDDEN_USER_ROLE_UPDATE.message);
            Err.status = REGISTER.FORBIDDEN_USER_ROLE_UPDATE.httpCode;
            return next(Err);
        }

        let updateObject = {
            fullName: firstName + ' ' + lastName,
            firstName: firstName,
            lastName: lastName,
            email: email,
            userName: userName,
            role: role,
            phoneCode: phoneCode,
            countryCode: countryCode,
            contactNumber: contactNumber,
            codeContactNumber: getCodeContactNumber(phoneCode, contactNumber)
        };

        if (role === 'admin') {
            let Err = new Error(REGISTER.FORBIDDEN_USER_ROLE.message);
            Err.status = REGISTER.FORBIDDEN_USER_ROLE.httpCode;
            return next(Err);
        }
        let updatedUser = await adminModel.findOneAndUpdate(
            {
                _id: ObjectId(req.params.userId)
            },
            {
                $set: updateObject
            },
            {
                new: true,
                useFindAndModify: false
            }
        )
        res.status(SUCCESS.httpCode).json({
            message: SUCCESS.message,
            data: updatedUser,
        });
    }

    async getUsers(req, res, next) {
        const usersData = await adminModel.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            data: usersData
        });
    }

    async getUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await adminModel.findById(userId);
            if (!user) return next(new Error('User does not exist'));
            res.status(200).json({
                data: user
            });
        } catch (error) {
            next(error)
        }
    }

    async deleteUser(req, res, next) {
        try {
            let adminUser = await adminModel.findOne(
                {
                    _id: ObjectId(req.params.userId)
                }
            );

            if (adminUser.role === 'admin') {
                let Err = new Error(REGISTER.FORBIDDEN_USER_ROLE_DELETE.message);
                Err.status = REGISTER.FORBIDDEN_USER_ROLE_DELETE.httpCode;
                return next(Err);
            }

            if (req.params.userId === req.user._id) {
                const webObj = await webModel.findOne({ user: user._id });

                if (!webObj) {
                    let Err = new Error(LOG_OUT.ACCESS_TOKEN_NOT_FOUND.message);
                    Err.status = LOG_OUT.ACCESS_TOKEN_NOT_FOUND.httpCode;
                    return next(Err);
                }

                await webModel.findOneAndDelete({ user: user._id, accessToken: webObj.acceessToken }).exec();

            }

            await adminModel.findOneAndDelete(
                {
                    _id: ObjectId(req.params.userId)
                }
            )
            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: {},
            });
        } catch (error) {
            next(error)
        }

    }

    async uploadImage(req, res, next) {
        try {

            let uploads = [];

            if (req.files) {
                let files = req.files['images'] || [];
                if (Array.isArray(files)) {
                    for (let i = 0; i < files.length; i++) {
                        const updatedImage = await imageService.imageExtensionConverter(files[i]);
                        let awsResponse = await awsService.s3Upload(files[i], updatedImage);
                        uploads.push({
                            source: 'aws',
                            url: awsResponse.Location,
                            type: 'Image'
                        });
                    }
                } else {
                    const updatedImage = await imageService.imageExtensionConverter(files);
                    let awsResponse = await awsService.s3Upload(files, updatedImage);
                    uploads.push({
                        source: 'aws',
                        url: awsResponse.Location,
                        type: 'Image'
                    });
                }


                res.status(SUCCESS.httpCode).json({
                    message: SUCCESS.message,
                    data: {
                        imageUrl: uploads[0].url
                    }
                });

            }


        } catch (e) {
            next(e);
        }
    }

}
module.exports.userController = userController;
module.exports.instance = new userController();