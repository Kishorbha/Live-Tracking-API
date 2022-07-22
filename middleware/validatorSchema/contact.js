const Joi = require('joi');
const JoiPhoneNumberExtensions = require('joi-phone-number-extensions');
const joi = Joi.extend(JoiPhoneNumberExtensions);

let phoneNumberWithCodeAndCountyCodeValidation = (errorMessage) => {
    return {
        phoneCode: joi.string().trim().required().regex(/^(\+?\d{1,4}|\d{1,5})$/).label('Phone code').error(() => "Enter a valid phone code"),
        countryCode: joi.string().required().max(4).label('Country code').error(() => "Enter a valid country code"),
        contactNumber: joi.phoneNumber().required().region(joi.ref('countryCode')).type('FIXED_LINE_OR_MOBILE').error(errors => {
            errors.forEach(err => {
                if (err.type === "any.required" || err.type === "any.empty") {
                    err.message = errorMessage || `What's your number?`;
                }
            });
            return errors;
        }).label('Contact number'),
        codeContactNumber: joi.string().trim().empty('').allow(null).optional().default(null).label('Contact number')
    };
};

let phoneNumberWithCodeAndCountyCodeUserValidation = (errorMessage) => {
    return {
        phoneCode: joi.string().trim().regex(/^(\+?\d{1,4}|\d{1,5})$/).label('Phone code').error(() => "Enter a valid phone code"),
        countryCode: joi.string().max(4).default('US').label('Country code').error(() => "Enter a valid country code"),
        contactNumber: joi.phoneNumber().required().region(joi.ref('countryCode')).type('FIXED_LINE_OR_MOBILE').error(errors => {
            errors.forEach(err => {
                if (err.type === "any.required" || err.type === "any.empty") {
                    err.message = errorMessage || `What's your number?`;
                }
            });
            return errors;
        }).label('Contact number'),
        codeContactNumber: joi.string().trim().empty('').allow(null).optional().default(null).label('Code Contact number')
    };
};

let phoneNumberAndHomePhoneNumberWithCodeAndCountyCodeValidation = (errorMessage) => {
    return {
        phoneCode: joi.string().trim().required().regex(/^(\+?\d{1,4}|\d{1,5})$/).label('Phone code').error(() => "Enter a valid phone code"),
        countryCode: joi.string().required().max(4).label('Country code').error(() => "Enter a valid country code"),
        phoneNumber: joi.phoneNumber().required().region(joi.ref('countryCode')).type('FIXED_LINE_OR_MOBILE').error(errors => {
            errors.forEach(err => {
                if (err.type === "any.required" || err.type === "any.empty") {
                    err.message = errorMessage || `What's your number?`;
                }
            });
            return errors;
        }).label('Phone number'),
        homePhone: joi.phoneNumber().allow(null, '').region(joi.ref('countryCode')).type('FIXED_LINE_OR_MOBILE').error(errors => {
            errors.forEach(err => {
                if (err.type === "any.required" || err.type === "any.empty") {
                    err.message = errorMessage || `What's your number?`;
                }
            });
            return errors;
        }).label('Home Phone Number'),
        codeContactNumber: joi.string().allow('', null).optional().label('Contact number')
    };
};

module.exports = {
    phoneNumberWithCodeAndCountyCodeValidation,
    phoneNumberAndHomePhoneNumberWithCodeAndCountyCodeValidation,
    phoneNumberWithCodeAndCountyCodeUserValidation,
};
