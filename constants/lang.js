module.exports = {
    SUCCESS: {
        httpCode: 200,
        message: 'Success'
    },
    NO_RECORD_FOUND: {
        httpCode: 204,
        message: 'No Record'
    },
    INVALID_REQUEST: {
        httpCode: 400,
        message: 'Not a valid request'
    },
    VALIDATION_ERROR: {
        httpCode: 422,
        message: 'Validation failed'
    },
    PAGE_NOT_FOUND: {
        httpCode: 404,
        message: 'invalid page'
    },
    UNAUTHORIZED: {
        httpCode: 401,
        message: 'Unauthorized'
    },

    LOGIN: {
        NOT_LOGGED_IN: {
            httpCode: 401,
            message: 'Access Forbidden. Please sign in.'
        },
        ALREADY_LOGGED_IN: {
            httpCode: 200,
            message: 'Welcome back, Thank you for staying with us.'
        },
        LOGIN_SUCCESS: {
            httpCode: 200,
            message: 'You have been logged in successfully.'
        },
        EXIST_CUSTOMER: {
            httpCode: 409,
            message: 'Customer already exists.'
        },
        DOES_NOT_EXIST_CUSTOMER: {
            httpCode: 409,
            message: 'Customer has not been created.'
        },
        INVALID_PASSWORD: {
            httpCode: 401,
            message: 'Paws in the air! Those details didn\'t match our records. Please try again.'
        },
        INVALID_CURRENT_PASSWORD: {
            httpCode: 422,
            message: `Sorry – looks like this password isn't valid.`,//'Current password is not valid.'
        },
        DEVICE_NOT_FOUND: {
            httpCode: 401,
            message: 'Access Forbidden. Please sign in.'
        },
        INVALID_TOKEN: {
            httpCode: 401,
            message: 'Invalid Token.'
        },
        USER_NOT_FOUND: {
            httpCode: 401,
            message: 'You are not logged in from this device.'
            // if user is not found  by id calculated by jwt from given token
            // if user is not returned by passport package
        },
        CREDENTIAL_NOT_FOUND: {
            httpCode: 401,
            message: 'Those details didn\'t match our records. Please try again.'
        },
        TOKEN_NOT_FOUND: {
            httpCode: 400,
            message: 'No auth token.'
        },
        TOKEN_EXPIRED: {
            httpCode: 401,
            message: 'Token has been expired.'
            //there is no unique code for refresh token and implemented as suggested by
            // https://tools.ietf.org/html/rfc6750#section-3.1
            // https://stackoverflow.com/questions/8855297/token-expired-json-rest-api-error-code
        },
        DISABLED_BY_ADMIN: {
            httpCode: 403,
            message: 'You have been temporarily disabled by administrator.Please contact administrator for further details.'
        },
        ACCOUNT_NOT_VERIFIED: {
            httpCode: 302,
            message: 'We need you to verify your account first. Need us to resend the verification email? Easy.'
            /*You have not verified your account. Please verify your account and try again later. Do you want to resend verification mail?*/
        },
        TERMS_UPDATED: {
            httpCode: 417,
            message: 'Our terms and condition has been updated recently. Please read and accept our terms and condition carefully before you continue.'
        },
        PRIVACY_UPDATED: {
            httpCode: 417,
            message: 'Our privacy policy has been updated recently. Please read and accept our privacy policy carefully before you continue.'
        },
        GOOGLE_NOT_REGISTERED: { // if google account is valid but not registered with baxta
            httpCode: 310, // redirect to registration
            message: `Are you already a Baxster? Looks like this email already exists.`
        },
    },
    CHECK_USER_NAME: {
        NOT_EXIST_USER_NAME: { httpCode: 200, message: 'Success' }
    },
    RESEND_EMAIL_VERIFICATION: {
        ALREADY_ACTIVE: { httpCode: 409, message: 'User is already active.' },
        NO_EMAIL_FOUND: {
            httpCode: 449,
            message: `Are you sure you entered the right email or username? That account doesn't ring a bell.`
        },
        RESEND_EMAIL_SUCCESS: {
            httpCode: 200, message: `Check your email! We've sent you a verification email.`,//'Please check your email to verify your account.'
        }
    },

    FORGOT_PASSWORD: {
        SUCCESS: {
            httpCode: 200,
            message: `Round of appaws! We've emailed you a link to reset your password.`
        },
        EMAIL_NOT_FOUND: {
            httpCode: 310, // redirect to registration
            message: `Are you sure you entered the right email? That account doesn't ring a bell.`
            // message: 'We are unable to find any account with this email.'
        },
    },
    CHANGE_PASSWORD: {
        SUCCESS: {
            httpCode: 200,
            message: `It worked! Your password has been changed.`,//'Password has been changed successfully.'
        },
        OLD_PASSWORD_MISMATCH: {
            httpCode: 421,
            message: `Old password doesn't match.`
        },
    },
    RESET_PASSWORD: {
        SUCCESS: {
            httpCode: 200,
            message: `It worked! Your password has been changed.`,//'Password has been changed successfully.'
        },
        INVALID_TOKEN: {
            httpCode: 422,
            message: 'Invalid token.'
        },
        EXPIRED_LINK: {
            httpCode: 422,
            message: 'Link has been expired.'
        },
        SAME_PASSWORD: {
            httpCode: 422,
            message: 'New password should not be same as your old password.'
        },
    },
    REGISTER: {
        REGISTER_SESSION_EXPIRED: {
            httpCode: 422,
            message: 'Sign up session has been expired, Please try again.'
        },
        INVALID_APPLE_REGISTER_REQUEST: {
            httpCode: 422,
            message: 'Sign up request using apple account is not valid please try again.'
        },
        INVALID_WECHAT_REGISTER_REQUEST: {
            httpCode: 422,
            message: 'Sign up request using wechat account is not valid please try again.'
        },
        REGISTER_SUCCESS_FOR_VERIFICATION: {
            httpCode: 200,
            message: `You're almost a Baxster! Check your email to verify your account.`
            // message: `Please check your email to verify your account.`/*You have been registered successfully. Please check your email to verify your account*/
            // message: `You're in! Welcome to the Baxta community. Please check your email to verify your account.`/*You have been registered successfully. Please check your email to verify your account*/
        },
        INVALID_REGISTER_REQUEST: {
            httpCode: 422,
            message: 'Sign up request is not valid please try again.'
        },
        REGISTER_SUCCESS: {
            httpCode: 200,
            message: 'Your profile is good to go!'
        },
        EXIST_EMAIL: {
            httpCode: 409,
            message: 'Email already exists.'
        },//changed by client
        EXIST_CONTACT_NUMBER: { httpCode: 409, message: 'Looks like this contact number already exists.' },/*contact number already exists*/
        EXIST_USER_NAME: { httpCode: 409, message: 'Username already exists.' },
        EXIST_FB_ID: { httpCode: 409, message: 'User already exists for this account.' },
        DISABLED_BY_ADMIN: {
            httpCode: 403,
            message: 'You have been temporarily disabled by administrator. Please contact administrator for further details.'
        },
        EMAIL_EXIST_NOT_VERIFIED: {
            httpCode: 302,
            message: 'Are you already a Baxster? Looks like this email already exists.'/*'Email exists but not verified.'*/
        },//changed by client
        EMAIL_EXIST_FB_REGISTER: {
            httpCode: 301,
            message: 'Email already exist for requested facebook account. Link this account to facebook.'
        },
        EMAIL_VERIFIED: { message: 'Your email is now verified. Welcome to the pack!' },
        INVALID_FB_TOKEN: { httpCode: 401, message: 'Invalid facebook access token.' },
        INVALID_EMAIL_VERIFICATION: { message: 'Invalid token.' },
        ACCEPT_TERMS: {
            httpCode: 422,
            message: 'Please read and accept our terms and condition before you continue.'
        },
        USER_DOESNT_EXIST: { httpCode: 409, message: 'Looks like this user doesnot exist' },
        FORBIDDEN_USER_ROLE: {
            httpCode: 403,
            message: 'User role cannot be admin'
        },
        FORBIDDEN_USER_ROLE_UPDATE: {
            httpCode: 403,
            message: 'This user role cannot be updated'
        },
        FORBIDDEN_USER_ROLE_DELETE: {
            httpCode: 403,
            message: 'This user role cannot be deleted'
        },
    },
    DRIVER: {
        CREATED: {
            httpCode: 200,
            message: 'Driver has been created successfully'
        },
        UPDATED: {
            httpCode: 200,
            message: 'Driver has been updated successfully'
        },
        STATUS_ACCEPTED: {
            httpCode: 200,
            message: 'Driver has been accepted successfully'
        },
        STATUS_DECLINE: {
            httpCode: 200,
            message: 'Driver has been rejected.'
        },
        UPDATED: {
            httpCode: 200,
            message: 'Driver has been updated successfully'
        },
        NOT_FOUND: {
            httpCode: 422,
            message: 'Driver not found.'
        },
        EMAIL_OR_PHONE_NUMBER_ALREADY_EXISTS: {
            httpCode: 400,
            message: 'This email or phone number already exists'
        },
        LIST: {
            httpCode: 200,
            message: 'Driver list obtained successfully'
        },
        DETAIL: {
            httpCode: 200,
            message: 'Driver detail obtained successfully'
        },
        DELETED: {
            httpCode: 200,
            message: 'Driver has been deleted successfully.'
        },
        NOT_PERMITTED: {
            httpCode: 400,
            message: 'You are not permitted to perform this action.'
        },
        REVIEW: {
            httpCode: 200,
            message: 'Driver review posted successfully'
        },
        ALREADY_ASSOCIATED_TO_TRUCK: {
            httpCode: 400,
            message: 'Driver already associated to another truck'
        },
        NOT_ASSOCIATED_TO_TRUCK: {
            httpCode: 400,
            message: 'Driver not associated with this truck.'
        },
        NOT_ALLOWED_TO_DELETE: {
            httpCode: 400,
            message: `Driver associated with the truck can't be deleted`
        },
        TRUCK_LOCATION_UPDATED: {
            httpCode: 200,
            message: 'Truck location and status updated.'
        },
        TRUCK_STATUS_UPDATE_ERROR: {
            httpCode: 400,
            message: 'You are not able to perform this action at the moment. Please contact your admin.'
        },
    },
    TRUCK: {
        CREATED: {
            httpCode: 200,
            message: 'Truck has been created successfully'
        },
        UPDATED: {
            httpCode: 200,
            message: 'Truck has been updated successfully'
        },
        STATUS_ACCEPTED: {
            httpCode: 200,
            message: 'Truck has been accepted successfully'
        },
        STATUS_DECLINE: {
            httpCode: 200,
            message: 'Truck has been rejected.'
        },
        UPDATED: {
            httpCode: 200,
            message: 'Truck has been updated successfully'
        },
        NOT_FOUND: {
            httpCode: 422,
            message: 'Truck not found.'
        },
        LIST: {
            httpCode: 200,
            message: 'Truck list obtained successfully'
        },
        DETAIL: {
            httpCode: 200,
            message: 'Truck detail obtained successfully'
        },
        DELETED: {
            httpCode: 200,
            message: 'Truck has been deleted successfully.'
        },
        NOT_PERMITTED: {
            httpCode: 400,
            message: 'You are not permitted to perform this action.'
        },
        REVIEW: {
            httpCode: 200,
            message: 'Truck review posted successfully'
        },
        DRIVER_ALREADY_ASSOCIATED: {
            httpCode: 400,
            message: 'Driver already associated with another truck.'
        },
        TRUCK_LOCATION_UPDATED: {
            httpCode: 200,
            message: 'Truck location and status updated.'
        },
        TRUCK_VIN_EXISTS: {
            httpCode: 400,
            message: 'Truck vin already exists.'
        },
        TRUCK_NUMBER_EXISTS: {
            httpCode: 400,
            message: 'Truck number already exists.'
        },
        TRUCK_VIN_NUMBER_EXISTS: {
            httpCode: 400,
            message: 'Truck vehicle identification number already exists.'
        }

    },
    DEVICE: {
        NOT_FOUND: {
            httpCode: 422,
            message: 'Device not found'
        },
    },
    USER: {
        EMAIL_USERNAME_CONTACT_NUMBER_ALREADY_EXISTS: {
            httpCode: 400,
            message: 'This email or username or contact number already exists'
        },
    },
    LOG_OUT: {
        SUCCESS: {
            httpCode: 200,
            message: "You've been logged out."
        },
        ACCESS_TOKEN_NOT_FOUND: {
            httpCode: 422,
            message: `Acess token doesn't match`
        },
        DEVICE_TOKEN_ALREADY_PRESENT: {
            httpCode: 409,
            message: `Device token already exist.`
        },
    },

};
