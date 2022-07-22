
require('dotenv').config();

const truckModel = require('../../../models/truck');
const driverModel = require('../../../models/driver');
const truckTypeModel = require('../../../models/truckTypes');
const holdStatusModel = require('../../../models/holdStatus')
const schedule = require('node-schedule');
const cron = require('node-cron');
const boxTruckTypesModel = require('../../../models/boxTruckTypes');
const { SUCCESS, INVALID_REQUEST, NO_RECORD_FOUND, TRUCK, DRIVER } = require('../../../constants/lang');
const controller = require('../../controller');
const { ObjectId } = require('../../../helpers/objectIdHelper');
const { isValidObject, paginateProvider, isValidPage, perPageLimit } = require('../../../modules/customServices');
const country = require('country-state-city').Country;
const { HOLD_TRUCK, AVAILABLE_TRUCK } = require('../../../constants/db');
const state = require('country-state-city').State;
const {
    HOLD_TRUCK_MINUTES,
} = require('../../../config')
const {
    createTruck,
    updateTruck,
    filterTrucks,
    listTrucks,
    getTruckDetail
} = require('../../../repositories/truckRepository');


class truckController extends controller {

    async create(req, res, next) {
        try {

            let truckResult = await createTruck(req, res, next);
            res.status(TRUCK.CREATED.httpCode).json({
                message: TRUCK.CREATED.message,
                data: truckResult,
            });

        } catch (e) {
            next(e);
        }
    }

    async edit(req, res, next) {
        try {
            let updatedTruck = await updateTruck(req, res, next);

            res.status(SUCCESS.httpCode).json({
                message: SUCCESS.message,
                data: updatedTruck,
            });
        } catch (e) {
            next(e);
        }
    }

    async getTrucks(req, res, next) {
        let {
            truckType,
            trailerType,
            hazmat,
            airride,
            iccbar,
            truckTrackType,
            status,
            vanModified,
            search,
            country,
            state,
            dimensionType,
            width,
            truckNumber,
            length,
            height,
            unitsOfMeasurement,
            truckWeight,
            bookedFrom,
            bookedTo,
            driver
        } = req.query
        let page = await isValidPage(req.query.page);
        const options = {
            page: page,
            limit: perPageLimit(),
            truckType,
            trailerType,
            hazmat,
            airride,
            iccbar,
            truckTrackType,
            status,
            vanModified,
            search: search,
            country,
            state,
            dimensionType,
            width,
            truckNumber,
            length,
            height,
            unitsOfMeasurement,
            truckWeight,
            bookedFrom,
            bookedTo,
            driver
        }

        let aggregateQuery = listTrucks(options);
        let groups = await truckModel.aggregatePaginate(aggregateQuery, options)

        let getPagination = await paginateProvider(groups)

        res.status(SUCCESS.httpCode).json({
            message: SUCCESS.message,
            ...getPagination,
        })
    }

    async filterTrucks(req, res, next) {
        let {
            truckTypes,
            hazmat,
            airride,
            iccbar,
            truckTrackType,
            boxTruckTypes,
            vanModified,
            status,
            search,
            country,
            state,
            dimensionType,
            width,
            length,
            height,
            payloadUnit,
            payloadWeight,
            bookedFrom,
            bookedTo,
            driver,
            liftGate,
            palletJack,
            tsa,
            twic,
            tankerEndorsement,
            trueDockHigh,
            coordinates,
            radiusInMiles,
        } = req.body

        let page = await isValidPage(req.query.page);
        const options = {
            page: page,
            limit: perPageLimit(),
            truckTypes: truckTypes,
            hazmat: hazmat,
            airride: airride,
            vanModified: vanModified,
            boxTruckTypes: boxTruckTypes,
            iccbar: iccbar,
            truckTrackType: truckTrackType,
            status: status,
            search: search,
            country: country,
            state: state,
            dimensionType: dimensionType,
            width: width,
            length: length,
            height: height,
            payloadUnit: payloadUnit,
            payloadWeight: payloadWeight,
            bookedFrom: bookedFrom,
            bookedTo: bookedTo,
            driver: driver,
            liftGate: liftGate,
            palletJack: palletJack,
            tsa: tsa,
            twic: twic,
            tankerEndorsement: tankerEndorsement,
            trueDockHigh: trueDockHigh,
            coordinates: coordinates,
            radiusInMiles: radiusInMiles,
        }
        let aggregateQuery = filterTrucks(options);
        let trucks = await truckModel.aggregatePaginate(aggregateQuery, options)
        let getPagination = await paginateProvider(trucks)

        res.status(SUCCESS.httpCode).json({
            message: SUCCESS.message,
            ...getPagination,
        })

    }

    async getTruck(req, res, next) {
        try {
            const truckId = req.params.truckId;
            const truck = await getTruckDetail(truckId);
            if (!truck) return next(new Error('Truck does not exist'));
            res.status(200).json({
                data: truck
            });
        } catch (error) {
            next(error)
        }
    }

    async deleteTruck(req, res, next) {
        try {
            const { truckId } = req.params;

            if (!await isValidObject(truckId)) {
                let Err = new Error(INVALID_REQUEST.message);
                Err.status = INVALID_REQUEST.httpCode;
                return next(Err);
            }

            let truck = await truckModel.findOne({
                _id: ObjectId(truckId)
            });

            if (!truck) {
                let Err = new Error(TRUCK.NOT_FOUND.message);
                Err.status = TRUCK.NOT_FOUND.httpCode;
                return next(Err);
            }

            await truckModel.findOneAndDelete({
                _id: ObjectId(truckId)
            });

            await driverModel.findOneAndUpdate(
                { _id: ObjectId(truck.driver) },
                {
                    $set: {
                        isTruckAssociated: false
                    }
                },
                { useFindAndModify: false, new: true });


            res.status(TRUCK.DELETED.httpCode).json({
                message: TRUCK.DELETED.message,
                data: {}
            })

        } catch (e) {
            next(e);
        }
    }

    async getTruckTypes(req, res, next) {
        try {
            const truckTypes = await truckTypeModel.find({}, { _id: 1, title: 1 });
            if (!truckTypes) {
                let Err = new Error(NO_RECORD_FOUND.message);
                Err.status = NO_RECORD_FOUND.httpCode;
                return next(Err);
            }
            res.status(200).json({
                message: SUCCESS.message,
                data: truckTypes
            });
        } catch (error) {
            next(error)
        }
    }

    async getBoxTruckTypes(req, res, next) {
        try {
            const boxTruckTypes = await boxTruckTypesModel.find({}, { _id: 1, title: 1 });
            if (!boxTruckTypes) {
                let Err = new Error(NO_RECORD_FOUND.message);
                Err.status = NO_RECORD_FOUND.httpCode;
                return next(Err);
            }
            res.status(200).json({
                message: SUCCESS.message,
                data: boxTruckTypes
            });
        } catch (error) {
            next(error)
        }
    }

    async getAllCountries(req, res, next) {
        try {
            let allCountries = country.getAllCountries();
            const keysToKeep = ['isoCode', 'name', 'phonecode'];

            const redux = array => array.map(o => keysToKeep.reduce((acc, curr) => {
                acc[curr] = o[curr];
                return acc;
            }, {}));

            res.status(200).json({
                message: SUCCESS.message,
                data: redux(allCountries)
            });
        } catch (error) {
            next(error)
        }
    }

    async getAllStatesOfACountry(req, res, next) {
        try {
            let allStates = state.getStatesOfCountry(req.query.countryCode)
            const keysToKeep = ['isoCode', 'name'];

            const redux = array => array.map(o => keysToKeep.reduce((acc, curr) => {
                acc[curr] = o[curr];
                return acc;
            }, {}));

            res.status(200).json({
                message: SUCCESS.message,
                data: redux(allStates)
            });
        } catch (error) {
            next(error)
        }
    }

    async updateTruckStatusAndLocation(req, res, next) {
        try {
            let { status, driver } = req.body
            let { truckId } = req.params;

            // truck find one
            let truckExist = await truckModel.findOne({
                _id: ObjectId(truckId)
            });

            if (truckExist) {
                let previousTruck = {
                    truck: truckId,
                    driver: driver,
                    status: status
                }
                const createpreviousTruck = new holdStatusModel(previousTruck);
                const result = await createpreviousTruck.save();
            }
            let truckHoldExpiresIn = new Date().getTime();
            if (status === HOLD_TRUCK) {

                truckHoldExpiresIn = HOLD_TRUCK_MINUTES(15);

                let task = cron.schedule('*/15 * * * *', async () => {
                    if (status === HOLD_TRUCK) {
                        console.log('truck hold ends now')
                        await truckModel.findOneAndUpdate(
                            { _id: ObjectId(truckId) },
                            { $set: { status: AVAILABLE_TRUCK, truckHoldExpiresIn: 0 } },
                            { useFindAndModify: false, new: true });
                        task.stop();
                    }
                });
                console.log('task', task);

                task.start();
            }

            let toggleObject = {
                status: status,
                truckHoldExpiresIn: truckHoldExpiresIn
            }

            let updatedTruckObj = await truckModel.findOneAndUpdate(
                { _id: ObjectId(truckId) },
                { $set: toggleObject },
                { useFindAndModify: false, new: true });

            res.status(TRUCK.TRUCK_LOCATION_UPDATED.httpCode).json({
                message: TRUCK.TRUCK_LOCATION_UPDATED.message,
                data: updatedTruckObj,
            })
        } catch (e) {
            next(e)
        }
    }

}

module.exports.truckController = truckController;
module.exports.instance = new truckController();
