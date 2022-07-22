const Joi = require('joi');
const JoiObjectId = require('joi-mongodb-objectid')
const { extractDateOnly } = require('./joiExtensions')
const joi = Joi.extend(JoiObjectId, extractDateOnly);
const enumVariables = require('../../config/enumVariables');
const { GEO_JSON_TYPES } = require('../../constants/db')
const gt = Object.values(GEO_JSON_TYPES);
const { phoneNumberAndHomePhoneNumberWithCodeAndCountyCodeValidation } = require('./contact');


let deviceInfoValidation = {
    deviceId: joi.string().trim().label('Device id'),
    deviceToken: joi.string().trim().empty('').allow(null).optional().default(null).label('Device token'),
};

let newPassword = joi.string().trim().not(joi.ref('currentPassword')).required().min(6).regex(/^\S*$/).label('New password').error(errors => {
    errors.forEach(err => {
        switch (err.type) {
            case "string.min":
                err.message = `We're going to need a little more from you. Choose a password with at least ${err.context.limit} characters`;
                break;
            case "string.regex.base":
                err.message = `Space is not allowed in password`;
                break;
            default:
                break;
        }
    });
    return errors;
});


let employersSchema = {
    name: joi.string().trim().max(200).optional().label('Emp Name'),
    email: joi.string().email({ minDomainAtoms: 2 }).optional().trim().label('Emp Email'),
    phoneNumber: joi.string().trim().optional().default(null).label('Emp Number'),
}



module.exports = {
    validationSchemas:
    {
        createDriverSchema: joi.object().keys({
            dateHired: joi.date().max('now').required().label('Date Hired').error(() => 'Hire Date must be less than or equal to' + ' ' + new Date().toUTCString()),
            hiredBy: joi.string().trim().max(200).required().label('Hired By'),
            email: joi.string().email({ minDomainAtoms: 2 }).trim().required().label('Email'),
            info: {
                firstName: joi.string().trim().max(200).required().label('First Name'),
                lastName: joi.string().trim().max(200).required().label('Last Name'),
                driverType: joi.string().valid([enumVariables.DRIVER_LICENSE_TYPE]).required().label('Driver Type'),
                // ...phoneNumberAndHomePhoneNumberWithCodeAndCountyCodeValidation(),
                phoneCode: joi.string().default(null).label('Phone Code'),
                CountryCode: joi.string().default(null).label('Country Code'),
                phoneNumber: joi.string().required().default(null).label('Phone Number'),
                homePhone: joi.string().allow(null).default(null).label('Home Phone'),
                dob: joi.date().max('now').optional().label('Date of Birth').error(() => 'Date of Birth must be less than or equal to' + ' ' + new Date().toUTCString()),
                address: {
                    displayAddress: joi.string().trim().max(200).label('Address'),
                    city: joi.string().trim().max(200).optional().allow(null).default(null).label('City'),
                    state: joi.string().trim().max(200).optional().allow(null).default(null).label('State'),
                    postalCode: joi.string().trim().optional().allow(null).max(200).label('Postal Code'),
                    country: joi.string().trim().optional().allow(null).default(null).label('Country'),
                    geometry: {
                        cordinates: {
                            type: joi.array().items(joi.number()).required().label('Type'),
                            index: joi.string().default('2dsphere').label('Index')
                        }
                    },
                },
                emergencyName: joi.string().trim().optional().max(200).label('Emergency Name'),
                emergencyPhone: joi.string().trim().optional().default(null).allow(null).label('Emergency Phone'),
                usCitizen: joi.boolean().default(false).label('US Citizen'),
                workPermission: joi.boolean().default(false).label('Work Permission'),
                dui: joi.boolean().default(false).label('DUI'),
                felonies: joi.boolean().default(false).label('Felonies'),
                tsa: joi.boolean().default(false).label('TSA'),
                hazmat: joi.boolean().default(false).label('Hazmat'),
            },
            experience: {
                total: joi.number().optional().label('Total'),
                employers: joi.array().items(employersSchema).optional().default(null).label('Employers')
            },
            documents: {
                licNum: joi.string().trim().max(20).optional().default(null).label("License Number"),
                licIssuedIn: {
                    country: joi.string().trim().optional().label('License Issued Country'),
                    state: joi.string().trim().optional().label('License Issued State'),
                },
                licClass: joi.string().valid([enumVariables.DRIVER_LICENSE_TYPE]).trim().optional().label('License Class'),
                licExpiration: joi.date().extractDateOnly().min('now').optional().allow(null).default(null).label('License Expiration Date'),
                licNonExpirable: joi.boolean().default(false).label('Non Expirable'),
                // licPictures: [{
                //     frontImageUrl: joi.string().trim().optional().default(null).label('Front Image Url'),
                //     backImageUrl: joi.string().trim().optional().default(null).label('Back Image Url'),
                // }
                // ],
                licFrontPictures: joi.array().items(joi.string()).optional().default(null).label('License Front Pictures'),
                licBackPictures: joi.array().items(joi.string()).optional().default(null).label('License Back Pictures'),

                insExists: joi.boolean().default(false).label('Insurance Exists'),
                insNum: joi.number().optional().default(0).label('Insurance Number'),
                insCompany: joi.string().trim().optional().label('Insurance Company'),
                insIssuedIn: {
                    country: joi.string().trim().optional().label('Insurance Issued Country'),
                    state: joi.string().trim().optional().label('Insurance Issued State'),
                },
                // insPictures: [{
                //     frontImageUrl: joi.string().trim().optional().default(null).label('Insurance Front Image Url'),
                //     backImageUrl: joi.string().trim().optional().default(null).label('Back Insurance Image Url'),
                // }],
                insFrontPictures: joi.array().items(joi.string()).optional().default(null).label('Insurance Front Pictures'),
                insBackPictures: joi.array().items(joi.string()).optional().default(null).label('Insurance Back Pictures'),
                insExpiration: joi.date().extractDateOnly().min('now').optional().allow(null).default(null).label('Insurance Expiration Date'),
                insRadius: joi.number().optional().default(0).label('Insurance Radius'),
                insLiability: joi.number().optional().default(0).label('Insurance Liability'),
                insAutoLiability: joi.number().optional().default(0).label('Insurance Auto Liability'),
                insCargo: joi.number().optional().default(0).label('Insurance Cargo'),
                insDeductible: joi.number().optional().default(0).label('Insurance Deductible'),
                insNationwide: joi.boolean().default(false).label('Insurance Nationwide'),
            },
            status: joi.number().optional().valid(enumVariables.DRIVER_STATUS).label('Driver Status'),
        }),
        loginSchema: joi.object().keys({
            email: joi.string().email({ minDomainAtoms: 2 }).trim().required().error(() => 'Invalid email or password'),
            password: joi.string().trim().required().error(() => 'Invalid email or password'),
            ...deviceInfoValidation
        }),

        changePassword: joi.object().keys({
            currentPassword: joi.string().trim().required().label('Current password'),
            newPassword: newPassword
        }),

        truckStatusAndLocationUpdateForDriver: joi.object()
            .keys({
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
                                .label('Longitude')
                                .error(() => 'Longitude must be -180 to 180'),
                            Joi.number()
                                .min(-90)
                                .max(90)
                                .label('Latitude')
                                .error(() => 'Latitude must be -90 to 90'),
                        ])
                        .label('Coordinates'), //.error( () => "Coordinates must contain Latitude and Longitude value")
                }).and('coordinates').optional().label('Location'),
                status: joi.number().optional().valid(enumVariables.TRUCK_STATUS_UPDATABLE_BY_DRIVER).label('Status'),
                currentLocation: joi.string().trim().max(200).optional().label("Current Location"),
            })

    }
};
