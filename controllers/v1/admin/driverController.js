
require('dotenv').config();

const driverModel = require('../../../models/driver');
const truckModel = require('../../../models/truck');
const { SUCCESS, INVALID_REQUEST } = require('../../../constants/lang');
const { DRIVER } = require('../../../constants/lang');
const controller = require('../../controller');
const { ObjectId } = require('../../../helpers/objectIdHelper');
const { isValidObject, paginateProvider, perPageLimit } = require('../../../modules/customServices');
const { profileById, createDriver, updateDriver, getDrivers, getDriversWhileEditTruck } = require('../../../repositories/driverRepository');
class driverController extends controller {

    async create(req, res, next) {
        try {

            let driverResponse = await createDriver(req, res, next);
            let driverProfile = await profileById(driverResponse._id)

            res.status(DRIVER.CREATED.httpCode).json({
                message: DRIVER.CREATED.message,
                data: driverProfile,
            });

        } catch (e) {
            next(e);
        }
    }

    async edit(req, res, next) {
        try {

            let driver = await driverModel.findOne(
                {
                    _id: ObjectId(req.params.driverId)
                }
            );

            if (!driver) {
                let Err = new Error(DRIVER.NOT_FOUND.message);
                Err.status = DRIVER.NOT_FOUND.httpCode;
                return next(Err);
            }

            let updatedDriver = await updateDriver(req, res, next);
            let driverProfile = await profileById(updatedDriver._id)

            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: driverProfile,
            })

        } catch (e) {
            next(e);
        }
    }

    async getDrivers(req, res, next) {
        let {
            page,
            retriveNameOnly,
            retrieveUnusedDrivers,
            search,
            truckId
        } = req.query
        const options = {
            page: page,
            limit: perPageLimit(),
            retriveNameOnly,
            retrieveUnusedDrivers,
            search,
            truckId
        }

        let aggregateQuery;

        if (truckId) {
            let truckObj = await truckModel.findOne({
                _id: ObjectId(truckId)
            });
            aggregateQuery = getDriversWhileEditTruck(options, truckObj.driver);
        } else {
            aggregateQuery = getDrivers(options);
        }

        let drivers = await driverModel.aggregatePaginate(aggregateQuery, options)
        let getPagination = await paginateProvider(drivers)

        res.status(SUCCESS.httpCode).json({
            message: SUCCESS.message,
            ...getPagination,
        })
    }

    async getDriver(req, res, next) {
        try {
            const driverId = req.params.driverId;
            const driver = await driverModel.findById(driverId);
            if (!driver) return next(new Error('Driver does not exist'));
            res.status(200).json({
                data: driver
            });
        } catch (error) {
            next(error)
        }
    }

    async deleteDriver(req, res, next) {
        try {
            const { driverId } = req.params;

            if (!await isValidObject(driverId)) {
                let Err = new Error(INVALID_REQUEST.message);
                Err.status = INVALID_REQUEST.httpCode;
                return next(Err);
            }

            let driver = await driverModel.findOne({
                _id: ObjectId(driverId)
            });

            if (!driver) {
                let Err = new Error(DRIVER.NOT_FOUND.message);
                Err.status = DRIVER.NOT_FOUND.httpCode;
                return next(Err);
            }

            let truckObj = await truckModel.findOne({
                driver: ObjectId(driverId)
            });

            if (truckObj) {
                let Err = new Error(DRIVER.NOT_ALLOWED_TO_DELETE.message);
                Err.status = DRIVER.NOT_ALLOWED_TO_DELETE.httpCode;
                return next(Err);
            }

            await driverModel.findOneAndDelete({
                _id: ObjectId(driverId)
            });

            res.status(DRIVER.DELETED.httpCode).json({
                message: DRIVER.DELETED.message,
                data: {}
            })

        } catch (e) {
            next(e);
        }
    }
}

module.exports.driverController = driverController;
module.exports.instance = new driverController();
