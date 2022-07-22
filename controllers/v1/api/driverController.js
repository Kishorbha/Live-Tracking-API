
require('dotenv').config();

const moment = require('moment');
const driverModel = require('../../../models/driver');
const truckModel = require('../../../models/truck');
const deviceModel = require('../../../models/devices');
const scheduler = require('node-schedule');
const { SUCCESS, CHANGE_PASSWORD, DRIVER, TRUCK, DEVICE } = require('../../../constants/lang');
const controller = require('../../controller');
const { HOLD_TRUCK } = require('../../../constants/db');
const { signAccessToken, signRefreshToken } = require('../../../modules/jwtToken');
const {
    validateCoordinates,
    paginateProvider,
    perPageLimit,
    isValidPage,
} = require('../../../modules/customServices');

const { ObjectId } = require('../../../helpers/objectIdHelper');
class driverController extends controller {

    async signIn(req, res, next) {
        try {

            const driver = req.user;

            const { accessToken, expiresIn } = await signAccessToken(driver._id);
            const refreshToken = await signRefreshToken(driver._id);

            let profile = await driverModel.profileById(driver._id);

            res.set('accessToken', accessToken);
            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: {
                    tokenData: {
                        accessToken,
                        refreshToken
                    },
                    profile: profile
                }
            });
        } catch (e) {
            next(e);
        }
    }

    async changePassword(req, res, next) {
        try {
            let { newPassword, currentPassword } = req.body
            const driver = req.user;
            let isValidPassword = await driver.isValidPassword(currentPassword);

            if (!isValidPassword) {
                let Err = new Error(CHANGE_PASSWORD.OLD_PASSWORD_MISMATCH.message)
                Err.status = CHANGE_PASSWORD.OLD_PASSWORD_MISMATCH.httpCode
                return next(Err)
            }

            let password = await driverModel.generatePassword(newPassword);

            await driverModel.updateOne(
                { _id: driver._id }, {
                $set: {
                    password,
                    firstTimeLogInRemaining: false
                }
            }).exec()

            res.status(CHANGE_PASSWORD.SUCCESS.httpCode).json({
                message: CHANGE_PASSWORD.SUCCESS.message,
                data: {},
            })
        } catch (e) {
            next(e)
        }
    }

    async listTrucksAndItsStatus(req, res, next) {
        try {

            const options = {
                page: req.query.page,
                limit: perPageLimit(),
            }
            let driverObj = await driverModel.findOne({
                _id: ObjectId(req.user._id)
            });

            if (!driverObj) {
                let Err = new Error(DRIVER.NOT_FOUND.message);
                Err.status = DRIVER.NOT_FOUND.httpCode;
                return next(Err);
            }

            let aggregateQuery = truckModel.listTrucksByDriverId(req.user._id);
            let truckLists = await truckModel.aggregatePaginate(aggregateQuery, options)
            let getPagination = await paginateProvider(truckLists)

            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                ...getPagination
            })
        } catch (e) {
            next(e)
        }
    }

    async updateTruckStatusAndLocation(req, res, next) {
        try {
            let { locationStationed, status, currentLocation } = req.body
            let { truckId } = req.params;
            let truckExist = await truckModel.findOne({
                _id: ObjectId(truckId)
            });

            if (!truckExist) {
                let Err = new Error(TRUCK.NOT_FOUND.message);
                Err.status = TRUCK.NOT_FOUND.httpCode;
                return next(Err);
            }

            let truckObj = await truckModel.findOne({
                driver: ObjectId(req.user._id)
            });

            if (!truckObj) {
                let Err = new Error(DRIVER.NOT_ASSOCIATED_TO_TRUCK.message);
                Err.status = DRIVER.NOT_ASSOCIATED_TO_TRUCK.httpCode;
                return next(Err);
            }

            if (status) {
                if (truckObj.status === HOLD_TRUCK) {
                    if (new Date().getTime() < truckObj.truckHoldExpiresIn) {
                        let Err = new Error(DRIVER.TRUCK_STATUS_UPDATE_ERROR.message);
                        Err.status = DRIVER.TRUCK_STATUS_UPDATE_ERROR.httpCode;
                        return next(Err);
                    }
                }
            }


            let coordinates = []

            if (locationStationed) {
                if (validateCoordinates({ lat: locationStationed.coordinates[1], lng: locationStationed.coordinates[0] })) {
                    coordinates = [parseFloat(locationStationed.coordinates[0]), parseFloat(locationStationed.coordinates[1])]
                }
            }

            let toggleObject = {
                status: (status !== null && status !== undefined) ? status : truckExist.status,
                currentLocation: ((currentLocation && currentLocation.length > 0) ? currentLocation : truckExist.currentLocation),
                locationStationed: ((locationStationed && locationStationed.coordinates.length > 0) ? {
                    coordinates: coordinates
                } : truckExist.locationStationed),
                lastSyncedDate: new Date()
            }

            let updatedTruckObj = await truckModel.findOneAndUpdate(
                { _id: ObjectId(truckId) },
                { $set: toggleObject },
                { useFindAndModify: false, new: true });

            res.status(DRIVER.TRUCK_LOCATION_UPDATED.httpCode).json({
                message: DRIVER.TRUCK_LOCATION_UPDATED.message,
                data: updatedTruckObj,
            })
        } catch (e) {
            next(e)
        }
    }

    async getTruck(req, res, next) {
        try {
            const truckId = req.params.truckId;
            const truck = await truckModel.findById(truckId);
            if (!truck) return next(new Error('Truck does not exist'));
            res.status(200).json({
                data: truck
            });
        } catch (error) {
            next(error)
        }
    }

    async logOut(req, res, next) {
        try {

            const user = req.user;

            // for removing notification token - done by Alina

            if (req.user) {
                await deviceModel.findOneAndDelete({
                    driverId: ObjectId(req.user._id)
                })
            }


            req.logout();
            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: {}
            });
        } catch (e) {
            console.log('err', e.message || e)
            next(e);
        }
    }

    // save registration toke to device model.
    async saveRegistrationToken(req, res, next) {
        try {

            // #region check if driver exists
            const driverExists = await driverModel.findOne({ _id: ObjectId(req.user._id) });
            if (!driverExists) {
                let Err = new Error(DRIVER.NOT_FOUND.message);
                Err.status = DRIVER.NOT_FOUND.httpCode;
                return next(Err);
            }

            const deviceExists = await deviceModel.findOne({ deviceId: req.body.deviceId });

            if (!deviceExists) {
                const createDeviceRegistration = new deviceModel(req.body);
                const driverRegistration = await createDeviceRegistration.save();
                res.status(201).json({
                    data: driverRegistration
                });
                return res

            }

            const updateRegistration = await deviceModel.findOneAndUpdate(
                {
                    deviceId: req.body.deviceId,
                },
                { $set: { registrationToken: req.body.registrationToken, driverId: ObjectId(req.body.driverId) } },
                { upsert: true, useFindAndModify: false, new: true }
            )
            res.status(201).json({
                data: updateRegistration
            });
            return res

        } catch (error) {
            next(error)
        }
    }
}

module.exports.driverController = driverController;
module.exports.instance = new driverController();
