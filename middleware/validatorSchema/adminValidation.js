const Joi = require('joi');
const JoiPhoneNumberExtensions = require('joi-phone-number-extensions');
const joi = Joi.extend(JoiPhoneNumberExtensions);
const enumVariables = require('../../config/enumVariables');
const { phoneNumberWithCodeAndCountyCodeValidation } = require('./contact');

let email = joi.string().required().email({ minDomainAtoms: 2 }).label('Email').error(errors => {
    errors.forEach(err => {
        if (err.type === "string.email") {
            err.message = `Please try again! We need a valid email address`;
        }
    });
    return errors;
});

let newPassword = joi.string().trim().required().min(6).regex(/^\S*$/).label('Password').error(errors => {
    errors.forEach(err => {
        switch (err.type) {
            case "string.min":
                err.message = `We're going to need a little more from you. Choose a password with at least ${err.context.limit} characters`;
                // err.message = `Please provide a password with minimum ${err.context.limit} characters`;
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
let changedPassword = joi.string().trim().not(joi.ref('currentPassword')).required()
    .regex(/^\S*$/)
    .error((errors) => {
        errors = errors[0] || {};
        if (errors.type === 'any.invalid') {
            return {
                message: 'New password can not be same as current'
            }
        } else {
            return {
                message: 'We\'re going to need a little more from you. Choose a password with at least six characters'
            }
        }
    }).label('New password')

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

let registerPassword = joi.string().trim().required().min(6).regex(/^\S*$/).label('Password').error(errors => {
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
            role: joi.string().trim().valid([enumVariables.userRole]).required().label('Role'),
            status: joi.number().valid([enumVariables.userStatus]).required().label('Status'),
            countryCode: joi.string().default(null),
            contactNumber: joi.string().default(null),
            codeContactNumber: joi.string().default(null),
            // ...phoneNumberWithCodeAndCountyCodeValidation()

        }),
        updateBasicProfile: joi.object().keys({
            fullName: joi.string().trim().max(200).required().label('Full name'),
            // firstName: joi.string().trim().max(200).required().label('First name'),
            // lastName: joi.string().trim().max(200).required().label('Last name'),
            email: joi.string().allow('').max(400).label('Description'),
        }),
        updateProfilePhoto: joi.object().keys({
            profilePhoto: joi.string().uri().trim().max(500).required().label('Profile photo'),

        }),
        resendEmailVerification: joi.object().keys({
            email: joi.string().required().email({ minDomainAtoms: 2 }).label('Email'),
        }),
        loginSchema: joi.object().keys({
            email: joi.string().email({ minDomainAtoms: 2 }).trim().required(),
            password: joi.string().trim().required(),
        }),
        changePassword: joi.object().keys({
            currentPassword: joi.string().trim().required().label('Current password'),
            newPassword: changedPassword
        }),
        forgotPassword: joi.object().keys({
            email: joi.string().required().email({ minDomainAtoms: 2 }).label('Email'),
        }),
        resetPassword: joi.object().keys({
            passwordToken: joi.string().required().label('Password token'),
            newPassword: newPassword,
            confirmPassword: joi.string().trim().required().valid(joi.ref('newPassword'))
                .error((errors) => {
                    errors = errors[0] || {};
                    if (errors.type === 'any.allowOnly') {
                        return {
                            message: 'Confirm password does not matched with new password'
                        }
                    } else {
                        return {
                            message: 'Password should contain at least one letter, one number, one special character and should not be less than eight character'
                        }
                    }
                }).label('Confirm password')
        })

    }
};


