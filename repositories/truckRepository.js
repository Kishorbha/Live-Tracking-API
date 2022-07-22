
const { ObjectId } = require('../helpers/objectIdHelper')
const { ObjectIds } = require('../helpers/objectHelper')
const driverModel = require('../models/driver')
const truckModel = require('../models/truck')
const enumVars = require('../config/enumVariables');
const { DRIVER, TRUCK } = require('../constants/lang');
const { GEO_JSON_TYPES, NOT_AVAILABLE_TRUCK } = require('../constants/db')
const moment = require('moment')

module.exports = {

    createTruck: async (req, res, next) => {
        let { vehicle, driver, status, locationStationed, bookedFrom,
            bookedTo, currentLocation
        } = req.body;

        let createNewTruck = {
            vehicle: vehicle,
            driver: driver,
            status: status,
            locationStationed,
            bookedFrom,
            bookedTo,
            currentLocation
        };

        const driverExists = await driverModel.findOne({ _id: ObjectId(driver) });

        if (!driverExists) {
            let Err = new Error(DRIVER.NOT_FOUND.message);
            Err.status = DRIVER.NOT_FOUND.httpCode;
            return next(Err);
        }

        if (driverExists.isTruckAssociated === true) {
            let Err = new Error(DRIVER.ALREADY_ASSOCIATED_TO_TRUCK.message);
            Err.status = DRIVER.ALREADY_ASSOCIATED_TO_TRUCK.httpCode;
            return next(Err);
        }


        let truckNumberExists = await truckModel.findOne({
            "vehicle.truckNumber": vehicle.truckNumber
        });

        if (truckNumberExists) {
            let Err = new Error(TRUCK.TRUCK_NUMBER_EXISTS.message);
            Err.status = TRUCK.TRUCK_NUMBER_EXISTS.httpCode;
            return next(Err);
        }

        let truckVinNumberExists = await truckModel.findOne({
            "vehicle.vin": vehicle.vin
        });

        if (truckVinNumberExists) {
            let Err = new Error(TRUCK.TRUCK_VIN_NUMBER_EXISTS.message);
            Err.status = TRUCK.TRUCK_VIN_NUMBER_EXISTS.httpCode;
            return next(Err);
        }

        const createTruck = new truckModel(createNewTruck);
        const truckResult = await createTruck.save();

        await driverModel.findOneAndUpdate(
            { _id: ObjectId(driver) },
            {
                $set: {
                    isTruckAssociated: true
                }
            },
            { useFindAndModify: false, new: true });

        return truckResult;

    },

    updateTruck: async (req, res, next) => {
        let { vehicle, driver, status,
            locationStationed, bookedFrom,
            bookedTo, currentLocation
        } = req.body;

        let truck = await truckModel.findOne(
            {
                _id: ObjectId(req.params.truckId)
            }
        );


        if (!truck) {
            let Err = new Error(TRUCK.NOT_FOUND.message);
            Err.status = TRUCK.NOT_FOUND.httpCode;
            return next(Err);
        }

        const driverExists = await driverModel.findOne({ _id: ObjectId(driver) });

        if (!driverExists) {
            let Err = new Error(DRIVER.NOT_FOUND.message);
            Err.status = DRIVER.NOT_FOUND.httpCode;
            return next(Err);
        }

        let toggleObject = {
            vehicle: (vehicle !== null && vehicle !== undefined) ? vehicle : truck.vehicle,
            driver: (driver !== null && driver !== undefined) ? driver : truck.driver,
            status: (status !== null && status !== undefined) ? status : truck.status,
            locationStationed: (locationStationed !== null && locationStationed !== undefined) ? locationStationed : truck.locationStationed,
            bookedFrom: (bookedFrom !== null && bookedFrom !== undefined) ? bookedFrom : truck.bookedFrom,
            bookedTo: (bookedTo !== null && bookedTo !== undefined) ? bookedTo : truck.bookedTo,
            currentLocation: (currentLocation !== null && currentLocation !== undefined) ? currentLocation : truck.currentLocation,
        }

        let updatedTruck = await truckModel.findOneAndUpdate(
            { _id: ObjectId(req.params.truckId) },
            { $set: toggleObject },
            { useFindAndModify: false, new: true });

        await driverModel.findOneAndUpdate(
            { _id: ObjectId(toggleObject.driver) },
            {
                $set: {
                    isTruckAssociated: true
                }
            },
            { useFindAndModify: false, new: true });

        return updatedTruck;
    },

    listTrucks: (options) => {
        let query = {
            $match: {
                $and: [
                    { status: { $in: enumVars.TRUCK_STATUS } },
                ]
            },
        }

        if (typeof options.search === 'string' && options.search.length > 0) {
            query.$match.$and.push({
                $or: [
                    { "vehicle.truckNumber": { $regex: options.search, $options: 'i' } },
                    { "driver.firstName": { $regex: options.search, $options: 'i' } },
                    { "driver.lastName": { $regex: options.search, $options: 'i' } }
                ],
            })
        }

        return truckModel.aggregate([
            {
                $lookup: {
                    from: 'drivers',
                    as: 'driver',
                    let: { driver: '$driver' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$driver'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                "firstName": "$info.firstName",
                                "lastName": "$info.lastName",
                                "phoneCode": "$info.phoneCode",
                                "countryCode": "$info.countryCode",
                                "phoneNumber": "$info.phoneNumber"
                            }
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'trucktypes',
                    as: 'trucktypes',
                    let: { trucktypes: '$vehicle.truckTypes' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$_id', '$$trucktypes'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1
                            }
                        }
                    ],
                },
            },
            {
                $lookup: {
                    from: 'boxtrucktypes',
                    as: 'boxtrucktypes',
                    let: { boxtrucktypes: '$vehicle.boxTruckTypes' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$boxtrucktypes'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1
                            }
                        }
                    ],
                },
            },
            {
                $project: {
                    vehicle: {
                        "issuedIn": 1,
                        "dimensions": 1,
                        "truckTypes": '$trucktypes',
                        "boxTruckTypes": { $ifNull: [{ $arrayElemAt: ['$boxtrucktypes', 0] }, null] },
                        "liftGate": 1,
                        "palletJack": 1,
                        "airride": 1,
                        "iccbar": 1,
                        "hazmat": 1,
                        "truckTrackType": 1,
                        "tsa": 1,
                        "twic": 1,
                        "tankerEndorsement": 1,
                        "trueDockHigh": 1,
                        "expiration": 1,
                        "nonExpirable": 1,
                        "licPictures": 1,
                        "make": 1,
                        "year": 1,
                        "payloadWeight": 1,
                        "dockHeightInInches": 1,
                        "vanModified": 1,
                        "truckNumber": { $toInt: "$vehicle.truckNumber" },
                        "vin": 1,
                        "model": 1,
                        "ownership": 1,
                        "payloadUnit": 1,
                        "dimensionType": 1,
                        "pictFront": 1,
                        "pictBack": 1,
                        "pictLeft": 1,
                        "pictRight": 1,
                        "pictCargo": 1,
                    },
                    driver: { $ifNull: [{ $arrayElemAt: ['$driver', 0] }, null] },
                    bookedFrom: 1,
                    bookedTo: 1,
                    currentLocation: 1,
                    status: 1,
                    truckHoldExpiresIn: 1,
                    lastSyncedDate: 1,
                    locationStationed: 1
                },
            },
            query,
            {
                $sort: {
                    "vehicle.truckNumber": 1,
                }
            },
        ])
    },

    filterTrucks: (options) => {
        let query = {
            $match: {
                $and: [
                    { status: { $in: enumVars.TRUCK_STATUS } },
                ]
            },
        }
        if (typeof options.search === 'string' && options.search.length > 0) {
            query.$match.$and.push({
                "vehicle.vin": { $regex: options.search, $options: 'i' }
            })
        }

        if (typeof options.driver === 'string' && options.driver.length > 0) {
            query.$match.$and.push({
                "driver": ObjectId(options.driver)
            })
        }

        if (typeof options.country === 'string' && options.country.length > 0) {
            query.$match.$and.push({
                "vehicle.issuedIn.country": options.country
            })
        }

        if (typeof options.state === 'string' && options.state.length > 0) {
            query.$match.$and.push({
                "vehicle.issuedIn.state": options.state
            })
        }

        if (typeof options.status === 'number') {
            query.$match.$and.push({
                "status": options.status,
            });
            if (
                (typeof options.bookedFrom === 'string' && options.bookedFrom.length > 0) &&
                (typeof options.bookedTo === 'string' && options.bookedTo.length > 0)
            ) {
                query.$match.$and.push(
                    {
                        "bookedFrom": {
                            $lte: new Date(options.bookedFrom),
                        }
                    });
                query.$match.$and.push({
                    "bookedTo": {
                        $gte: new Date(options.bookedTo),
                    }
                })
            }
        }

        if (
            (typeof options.dimensionType === 'string' && options.dimensionType.length > 0) &&
            (typeof options.length === 'number' && options.length > 0) &&
            (typeof options.width === 'number' && options.width > 0) &&
            (typeof options.height === 'number' && options.height > 0)
        ) {

            query.$match.$and.push({
                "vehicle.dimensionType": options.dimensionType
            });
            query.$match.$and.push(
                {
                    "vehicle.dimensions.length": { $gte: parseFloat(options.length) }
                },
                {
                    "vehicle.dimensions.width": { $gte: parseFloat(options.width) }
                },
                {
                    "vehicle.dimensions.height": { $gte: parseFloat(options.height) }
                },
            )

        }


        if (
            (typeof options.payloadWeight === 'number' && options.payloadWeight > 0)
        ) {
            query.$match.$and.push(
                {
                    "vehicle.payloadWeight": { $gte: parseFloat(options.payloadWeight) }
                },
            )

        }


        if (typeof options.hazmat === 'boolean') {
            query.$match.$and.push({
                "vehicle.hazmat": options.hazmat
            })
        }

        if (typeof options.airride === 'boolean') {
            query.$match.$and.push({
                "vehicle.airride": { $eq: options.airride }
            })
        }

        if (typeof options.vanModified === 'boolean') {
            query.$match.$and.push({
                "vehicle.vanModified": { $eq: options.vanModified }
            })
        }

        if (typeof options.iccbar === 'boolean') {
            query.$match.$and.push({
                "vehicle.iccbar": { $eq: options.iccbar }
            })
        }

        if (typeof options.liftGate === 'boolean') {
            query.$match.$and.push({
                "vehicle.liftGate": { $eq: options.liftGate }
            })
        }


        if (typeof options.palletJack === 'boolean') {
            query.$match.$and.push({
                "vehicle.palletJack": { $eq: options.palletJack }
            })
        }

        if (typeof options.tsa === 'boolean') {
            query.$match.$and.push({
                "vehicle.tsa": { $eq: options.tsa }
            })
        }

        if (typeof options.twic === 'boolean') {
            query.$match.$and.push({
                "vehicle.twic": { $eq: options.twic }
            })
        }

        if (typeof options.tankerEndorsement === 'boolean') {
            query.$match.$and.push({
                "vehicle.tankerEndorsement": { $eq: options.tankerEndorsement }
            })
        }

        if (typeof options.trueDockHigh === 'boolean') {
            query.$match.$and.push({
                "vehicle.trueDockHigh": { $eq: options.trueDockHigh }
            })
        }

        if (typeof options.truckTrackType === 'string' && options.truckTrackType.length > 0) {
            query.$match.$and.push({
                "vehicle.truckTrackType": { $eq: options.truckTrackType }
            })
        }

        if (typeof options.truckTypes === 'object' && Object.keys(options.truckTypes).length !== 0) {
            query.$match.$and.push({
                "vehicle.truckTypes": { $in: ObjectIds(options.truckTypes) }
            })
        }

        if (typeof options.boxTruckTypes === 'string' && options.boxTruckTypes.length > 0) {
            query.$match.$and.push({
                "vehicle.boxTruckTypes": ObjectId(options.boxTruckTypes)
            })
        }

        if (
            (Array.isArray(options.coordinates) && options.coordinates.length === 2)
            && (typeof options.radiusInMiles === 'number' && options.radiusInMiles > 0)
        ) {
            query = {
                $geoNear: {
                    near: {
                        type: GEO_JSON_TYPES.POINT,
                        coordinates: options.coordinates,
                    },
                    distanceMultiplier: 0.000621371, // distance in miles
                    maxDistance: parseFloat(options.radiusInMiles) * 1609.34,// in meters
                    distanceField: 'distance',
                    spherical: true,
                    query: query.$match,
                },
            }
        }


        return truckModel.aggregate([
            query,
            {
                $lookup: {
                    from: 'drivers',
                    as: 'driver',
                    let: { driver: '$driver' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$driver'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                "firstName": "$info.firstName",
                                "lastName": "$info.lastName",
                                "phoneCode": "$info.phoneCode",
                                "countryCode": "$info.countryCode",
                                "phoneNumber": "$info.phoneNumber"
                            }
                        }
                    ],
                },
            },
            {
                $lookup: {
                    from: 'trucktypes',
                    as: 'trucktypes',
                    let: { trucktypes: '$vehicle.truckTypes' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$_id', '$$trucktypes'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1
                            }
                        }
                    ],
                },
            },
            {
                $lookup: {
                    from: 'boxtrucktypes',
                    as: 'boxtrucktypes',
                    let: { boxtrucktypes: '$vehicle.boxTruckTypes' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$boxtrucktypes'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1
                            }
                        }
                    ],
                },
            },
            {
                $project: {
                    vehicle: {
                        "issuedIn": 1,
                        "dimensions": 1,
                        "truckTypes": '$trucktypes',
                        "boxTruckTypes": { $ifNull: [{ $arrayElemAt: ['$boxtrucktypes', 0] }, null] },
                        "liftGate": 1,
                        "palletJack": 1,
                        "airride": 1,
                        "iccbar": 1,
                        "hazmat": 1,
                        "truckTrackType": 1,
                        "tsa": 1,
                        "twic": 1,
                        "tankerEndorsement": 1,
                        "trueDockHigh": 1,
                        "expiration": 1,
                        "nonExpirable": 1,
                        "licPictures": 1,
                        "make": 1,
                        "year": 1,
                        "payloadWeight": 1,
                        "dockHeightInInches": 1,
                        "vanModified": 1,
                        "truckNumber": 1,
                        "vin": 1,
                        "model": 1,
                        "ownership": 1,
                        "payloadUnit": 1,
                        "dimensionType": 1,
                        "pictFront": 1,
                        "pictBack": 1,
                        "pictLeft": 1,
                        "pictRight": 1,
                        "pictCargo": 1
                    },
                    driver: { $ifNull: [{ $arrayElemAt: ['$driver', 0] }, null] },
                    bookedFrom: 1,
                    bookedTo: 1,
                    distance: { $ifNull: ['$distance', null] },
                    currentLocation: 1,
                    status: 1,
                    truckHoldExpiresIn: 1,
                    lastSyncedDate: 1,
                    locationStationed: 1
                },
            },
            {
                $sort: {
                    distance: 1,
                }
            }
        ])
    },

    getTruckDetail: async (truckId) => {
        truckId = ObjectId(truckId)
        let trucks = await truckModel.aggregate([
            {
                $match: {
                    _id: truckId,
                },
            },
            {
                $lookup: {
                    from: 'drivers',
                    as: 'driver',
                    let: { driver: '$driver' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$driver'],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                "firstName": "$info.firstName",
                                "lastName": "$info.lastName",
                                "phoneCode": "$info.phoneCode",
                                "countryCode": "$info.countryCode",
                                "phoneNumber": "$info.phoneNumber"
                            }
                        }
                    ],
                },
            },
            {
                $project: {
                    vehicle: 1,
                    driver: { $ifNull: [{ $arrayElemAt: ['$driver', 0] }, null] },
                    bookedFrom: 1,
                    bookedTo: 1,
                    currentLocation: 1,
                    status: 1,
                    truckHoldExpiresIn: 1,
                    lastSyncedDate: 1,
                    locationStationed: 1
                },

            },
        ])

        if (!trucks.length) return null
        return trucks.pop() || {}
    },


}
