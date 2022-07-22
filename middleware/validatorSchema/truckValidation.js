const Joi = require('joi');
const JoiObjectId = require('joi-mongodb-objectid')
const { extractDateOnly } = require('./joiExtensions')
const joi = Joi.extend(JoiObjectId, extractDateOnly);
const enumVariables = require('../../config/enumVariables');
const { GEO_JSON_TYPES } = require('../../constants/db')
const gt = Object.values(GEO_JSON_TYPES)



module.exports = {
    validationSchemas:
    {
        createTruckSchema: joi.object().keys({
            vehicle: {
                truckNumber: Joi.string().regex(/^[0-9]+$/).label("Truck Number").error(() => 'Truck Number must be numbers only'),
                vin: joi.string().trim().max(200).required().label('Vehicle Identification Number'),
                truckTypes: joi.array().items(joi.objectId()).required().label('Truck Types'),
                boxTruckTypes: joi.objectId().optional().default(null).label('Box Truck Types'),
                truckTrackType: joi.string().trim().max(20).optional().label("Truck Track Type"),
                issuedIn: {
                    country: joi.string().trim().max(200).required().label('Country'),
                    state: joi.string().trim().max(200).required().label('State')
                },
                expiration: joi.date().extractDateOnly().min('now').optional().allow(null).default(null).label('Expiration date'),
                year: joi.date().extractDateOnly().max('now').optional().allow(null).default(null).label('Year'),
                bookedFrom: joi.date().min('now').optional().allow(null).default(null).label('Booked From'),
                bookedTo: joi.date().min('now').optional().allow(null).default(null).label('Booked To'),
                nonExpirable: joi.boolean().default(false).label('Non Expirable'),
                hazmat: joi.boolean().default(false).label('Hazmat'),
                airride: joi.boolean().default(false).label('Air ride'),
                iccbar: joi.boolean().default(false).label('Icc bar'),
                liftGate: joi.boolean().default(false).label('Lift Gate'),
                palletJack: joi.boolean().default(false).label('Icc bar'),
                tsa: joi.boolean().default(false).label('Transportation Security Administration'),
                twic: joi.boolean().default(false).label('Transportation Worker Identification Credential'),
                tankerEndorsement: joi.boolean().default(false).label('Tanker Endorsement'),
                trueDockHigh: joi.boolean().default(false).label('True Dock High'),
                vanModified: joi.boolean().default(false).label('Van Modified'),

                make: joi.string().trim().max(200).required().label('Make'),
                model: joi.string().trim().max(200).required().label('Model'),
                ownership: joi.string().trim().max(200).required().label('Ownership'),
                dimensions: {
                    width: joi.number().required().label('Width'),
                    length: joi.number().required().label('Length'),
                    height: joi.number().required().label('Height'),
                },
                payloadWeight: joi.number().required().label('Truck Weight'),
                licPictures: joi.array().items(joi.string()).optional().default(null).label('License Pictures'),
                payloadUnit: joi.string().trim().required().valid(enumVariables.WEIGHT_TYPE).label('Unit of measurement'),
                dimensionType: joi.string().trim().required().valid(enumVariables.TRUCK_DIMENSION_TYPE).label('Dimension type'),
                pictFront: joi.string().trim().optional().default(null).label("Front picture"),
                pictBack: joi.string().trim().optional().default(null).label("Back picture"),
                pictLeft: joi.string().trim().optional().default(null).label("Left picture"),
                pictRight: joi.string().trim().optional().default(null).label("Right picture"),
                pictCargo: joi.string().trim().optional().default(null).label("Cargo picture"),
            },
            locationStationed: joi.object().keys({
                _id: Joi.any(),
                type: Joi.string()
                    .trim()
                    .valid(gt)
                    .default(GEO_JSON_TYPES.POINT)
                    .label('Coordinate type')
                    .error(() => `Coordinate type is not allowed or it must be one of [${gt.join(',')}]`),
                coordinates: Joi.array()
                    .ordered([
                        Joi.number()
                            .min(-180)
                            .max(180)
                            .optional()
                            .label('Longitude')
                            .error(() => 'Longitude must be -180 to 180'),
                        Joi.number()
                            .min(-90)
                            .max(90)
                            .optional()
                            .label('Latitude')
                            .error(() => 'Latitude must be -90 to 90'),
                    ])
                    .optional()
                    .label('Coordinates').error(() => "Coordinates must contain Latitude and Longitude value")
            }),
            currentLocation: joi.string().trim().max(200).optional().default(null).label("Current Location"),
            status: joi.number().optional().valid(enumVariables.TRUCK_STATUS).label('Status'),
            iccbar: joi.boolean().default(false).label('Icc bar'),
            team: joi.boolean().default(false).label('Team'),
            alternativeDrivers: Joi.when('team', {
                is: joi.boolean().valid(true),
                then: joi.array().items(joi.objectId()).required().label('Alternative Drivers'),
                otherwise: joi.array().optional().default(null).label('Alternative Drivers'),
            }),
            driver: joi.objectId().required().label('Driver')
        }),

        truckStatusAndLocation: joi.object()
            .keys({
                // locationStationed: joi.object().keys({
                //     _id: Joi.any(),
                //     type: Joi.string()
                //         .trim()
                //         .valid(gt)
                //         .default(GEO_JSON_TYPES.POINT)
                //         .label('Coordinate type')
                //         .error(() => `Coordinate type is not allowed or it must be one of [${gt.join(',')}]`),
                //     coordinates: Joi.array()
                //         .ordered([
                //             Joi.number()
                //                 .min(-180)
                //                 .max(180)
                //                 .optional()
                //                 .label('Longitude')
                //                 .error(() => 'Longitude must be -180 to 180'),
                //             Joi.number()
                //                 .min(-90)
                //                 .max(90)
                //                 .optional()
                //                 .label('Longitude')
                //                 .error(() => 'Latitude must be -90 to 90'),
                //         ])
                //         .optional()
                //         .label('Coordinates'), //.error( () => "Coordinates must contain Latitude and Longitude value")
                // }).and('coordinates').optional().label('Location'),
                status: joi.number().required().valid(enumVariables.TRUCK_STATUS).label('Status'),
                // currentLocation: joi.string().trim().max(200).optional().label("Current Location"),
            })
    }
};



