const Joi = require('joi');
const JoiPhoneNumberExtensions = require('joi-phone-number-extensions');
const JoiObjectId = require('joi-mongodb-objectid');
const joi = Joi.extend(JoiObjectId, JoiPhoneNumberExtensions);
const enumVariables = require('../../config/enumVariables');
const { phoneNumberWithCodeAndCountyCodeUserValidation } = require('./contact');

// let registerPassword = joi.string().trim().required().regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/).error( () => "Password should contain at least one letter, one number, one special character and should not less than eight character" );
let registerPassword = joi.string().trim().min(6).regex(/^\S*$/).label('Password').error(errors => {
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

let currentPassword = joi.string().trim().required().label('Current Password');
let password = joi.string().trim().required().error(() => 'Invalid password');

/*let newPassword = joi.string().trim().not(joi.ref('currentPassword')).required()
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/);*/
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

let confirmPassword = joi.string().trim().required().valid(joi.ref('newPassword'))
    .error(() => 'Confirm password does not matched with new password').label('Confirm password');

let email = joi.string().required().email({ minDomainAtoms: 2 }).label('Email').error(errors => {
    errors.forEach(err => {
        if (err.type === "string.email") {
            err.message = `Please try again! We need a valid email address`;
        }
    });
    return errors;
});


let deviceInfoValidation = {
    deviceId: joi.string().trim().required().label('Device id'),
    deviceToken: joi.string().trim().empty('').allow(null).optional().default(null).label('Device token'),
    deviceType: joi.number().integer().valid(enumVariables.deviceType).optional().default(1).label('Device type'),
};

/*
^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$
 └─────┬────┘└───┬──┘└─────┬─────┘└─────┬─────┘ └───┬───┘
       │         │         │            │           no _ or . at the end
       │         │         │            │
       │         │         │            allowed characters
       │         │         │
       │         │         no __ or _. or ._ or .. inside
       │         │
       │         no _ or . at the beginning
       │
       username is 8-20 characters long
*/
let userName = joi.string().trim().required().min(2).max(25).regex(/^\S*$/).label('Username').error(errors => {
    errors.forEach(err => {
        switch (err.type) {
            case "string.min":
                err.message = `Your username should be at least ${err.context.limit} characters`;
                break;
            case "string.regex.base":
                err.message = `Space is not allowed in username`;
                break;
            default:
                break;
        }
    });
    return errors;
});

let googleValidation = {
    id_token: joi.string().trim().required().label('Id token'),

};
module.exports = {
    validationSchemas:
    {
        registerSchema: joi.object().keys({
            firstName: joi.string().trim().max(200).required().label('First name'),
            lastName: joi.string().trim().max(200).required().label('Last name'),
            email: email.trim().empty('').allow(null).optional().default(null),
            password: registerPassword,
            confirmPassword: joi.any().optional().valid(joi.ref('password')).options({ language: { any: { allowOnly: 'Confirm password does not matched' } } }).label('Confirm password'),
            userName: userName,
            role: joi.string().valid([enumVariables.userRole]).required().label('Role'),
            status: joi.number().valid([enumVariables.userStatus]).optional().label('Status'),
            countryCode: joi.string().default(null),
            countryNumber: joi.string().default(null),
            countryContactNumber: joi.string().default(null),

        //     ...phoneNumberWithCodeAndCountyCodeUserValidation()

        }),
        checkUserName: joi.object().keys({
            userName: userName,
        }),
        checkEmail: joi.object().keys({
            email
        }),
        loginSchema: joi.object().keys({
            userName: joi.string().trim().required().error(() => 'Invalid username or password'),
            password: joi.string().trim().required().error(() => 'Invalid username or password'),
            ...deviceInfoValidation
        }),

        changePassword: joi.object().keys({
            currentPassword: joi.string().trim().required().label('Current password'),
            newPassword: newPassword
        }),
        forgotPassword: joi.object().keys({
            email,
        }),
        sendNewEmailVerificationCode: joi.object().keys({
            email
        }),
        setDeviceToken: joi.object().keys({
            deviceToken: joi.string().trim().required().label('Device token'),
        }),
        checkContactNumber: joi.object().keys({
            codeContactNumber: joi.string().trim().required().regex(/^[0-9+]+$/).label('Contact Number').error(() => 'Please enter valid contact number'),
        }),
    }
};
