const { ObjectId } = require('../helpers/objectIdHelper')
const driverModel = require('../models/driver')
const enumVars = require('../config/enumVariables');
const { uniqueDriverCode } = require('../modules/uniqueCode');
const { DRIVER } = require('../constants/lang');

module.exports = {

    createDriver: async (req, res, next) => {
        let {
            status, dateHired, hiredBy, info, phoneNumber, email, experience, documents
        } = req.body;

        let driverUniqueCode = await uniqueDriverCode();
        let createNewDriver = {
            status: status,
            dateHired: dateHired,
            hiredBy: hiredBy,
            info: info,
            email: email,
            password: info.phoneNumber,
            experience: experience,
            documents: documents,
            driverCode: driverUniqueCode,
        };

        const driverEmailExits = await driverModel.findOne({ $or: [{ email: email }, { "info.phoneNumber": info.phoneNumber }] });

        if (driverEmailExits) {
            let Err = new Error(DRIVER.EMAIL_OR_PHONE_NUMBER_ALREADY_EXISTS.message);
            Err.status = DRIVER.EMAIL_OR_PHONE_NUMBER_ALREADY_EXISTS.httpCode;
            return next(Err);
        }


        const createDriver = new driverModel(createNewDriver);
        const driverResponse = await createDriver.save();

        return driverResponse;

    },

    updateDriver: async (req, res, next) => {
        let { status, dateHired, hiredBy, info, email, experience, documents,
        } = req.body;


        let toggleObject = {
            status: status,
            dateHired: dateHired,
            email: email,
            hiredBy: hiredBy,
            info: info,
            experience: experience,
            documents: documents
        }

        let updatedDriver = await driverModel.findOneAndUpdate(
            { _id: ObjectId(req.params.driverId) },
            { $set: toggleObject },
            { useFindAndModify: false, new: true });

        return updatedDriver;
    },

    profileById: async (driverId) => {
        driverId = ObjectId(driverId)
        let drivers = await driverModel.aggregate([
            {
                $match: {
                    _id: driverId,
                },
            },
            {
                $project: {
                    "address": "$info.address",
                    "displayAddress": "$info.displayAddress",
                    "phoneCode": "$info.phoneCode",
                    "countryCode": "$info.countryCode",
                    "homePhone": "$info.homePhone",
                    "firstName": "$info.firstName",
                    "lastName": "$info.lastName",
                    "driverType": "$info.driverType",
                    "phoneNumber": "$info.phoneNumber",
                    "dob": "$info.dob",
                    "status": "$status",
                    "dateHired": "$dateHired",
                    "hiredBy": "$hiredBy",
                    "email": "$email",

                },
            },
        ])

        if (!drivers.length) return null
        return drivers.pop() || {}
    },

    getDrivers: (options) => {
        let query = {
            $match: {
                $and: [
                    { status: { $in: enumVars.TRUCK_STATUS } },
                ]
            },
        }

        if (typeof options.retrieveUnusedDrivers === 'string' && options.retrieveUnusedDrivers.length > 0) {
            query.$match.$and.push({
                "isTruckAssociated": false
            })

        };

        if (typeof options.search === 'string' && options.search.length > 0) {
            query.$match.$and.push({
                $or: [{ "info.firstName": { $regex: options.search, $options: 'i' } }, { "info.lastName": { $regex: options.search, $options: 'i' } }, { "email": { $regex: options.search, $options: 'i' } }],
            })
        }

        let stages = [query];

        if (typeof options.retriveNameOnly === 'string' && options.retriveNameOnly.length > 0) {
            stages.push({
                $project: {
                    _id: 1,
                    "firstName": '$info.firstName',
                    "lastName": "$info.lastName"
                }
            })

        } else {
            stages.push({
                $project: {
                    _id: 1,
                    "info": 1,
                    "experience": 1,
                    "documents": 1,
                    "email": 1,
                    "dateHired": 1,
                    "hiredBy": 1,
                    "driverCode": 1,
                    "isTruckAssociated": 1
                }
            });
        }


        return driverModel.aggregate(stages)
    },

    getDriversWhileEditTruck: (options, driverId) => {
        let query = {
            $match: {
                _id: ObjectId(driverId)
            },
        }


        if (typeof options.search === 'string' && options.search.length > 0) {
            query.$match.$and.push({
                $or: [{ "info.firstName": { $regex: options.search, $options: 'i' } }, { "info.lastName": { $regex: options.search, $options: 'i' } }, { "email": { $regex: options.search, $options: 'i' } }],
            })
        }

        let stages = [query];

        if (typeof options.retriveNameOnly === 'string' && options.retriveNameOnly.length > 0) {
            stages.push({
                $project: {
                    _id: 1,
                    "firstName": '$info.firstName',
                    "lastName": "$info.lastName"
                }
            })

        } else {
            stages.push({
                $project: {
                    _id: 1,
                    "info": 1,
                    "experience": 1,
                    "documents": 1,
                    "email": 1,
                    "dateHired": 1,
                    "hiredBy": 1,
                    "driverCode": 1,
                    "isTruckAssociated": 1
                }
            });
        }

        return driverModel.aggregate(stages)
    },
}
