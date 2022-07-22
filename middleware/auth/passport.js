const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const config = require('../../config');
const adminModel = require('../../models/admins');
const deviceModel = require('../../models/devices');
const pageModel = require('../../models/pages');
const driverModel = require('../../models/driver');

const { LOGIN, REGISTER, UNAUTHORIZED } = require('../../constants/lang');
const { TERMS_SLUG, PRIVACY_SLUG } = require('../../constants/db');
const moment = require('moment');
const {
    validateToken,
} = require('../../helpers/jwtHelper');
const secureUser = { __v: 0 };

// JWT strategy to extract and verify JWT token from request
passport.use('jwt', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.JWT_ACCESS_TOKEN_SECRET,
    passReqToCallback: true
}, async (req, payload, done) => {
    try {
        const driver = await driverModel.findById(payload.sub, secureUser);

        // If user doesn't exists, handle it
        if (!driver) {
            let Err = new Error(LOGIN.INVALID_TOKEN.message);
            Err.status = LOGIN.INVALID_TOKEN.httpCode;
            return done(Err);
        }

        let status = driver.status;//check if admin has mad changes in this account after token is issued
        let Err;
        switch (status) {
            case 0:
                Err = new Error(LOGIN.ACCOUNT_NOT_VERIFIED.message);
                Err.status = LOGIN.ACCOUNT_NOT_VERIFIED.httpCode;
                return done(Err);
            case 2:
                Err = new Error(LOGIN.DISABLED_BY_ADMIN.message);
                Err.status = LOGIN.DISABLED_BY_ADMIN.httpCode;
                return done(Err);
            default:
                break;
        }

        // Otherwise, return the user
        return done(null, driver);
    } catch (error) {
        return done(error, false);
    }
}));


// LOCAL strategy to extract and verify user name and password from request
// passport.use('local', new LocalStrategy({
//     usernameField: 'userName',
//     passwordField: 'password'
// }, async (userName, password, done) => {
//     let Err;
//     try {
//         userName = userName.toLowerCase();

//         // Find user with given email
//         const foundUser = await driverModel.findOne({ $or: [{ email: userName }, { codeContactNumber: userName }, { contactNumber: userName }] }, secureUser);
//         // If not , handle it
//         if (!foundUser) {
//             Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
//             Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
//             return done(Err);
//         }

//         // Check if the password is correct
//         const isMatch = await foundUser.isValidPassword(password);

//         // If not, handle it
//         if (!isMatch) {
//             Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
//             Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
//             return done(Err);
//         }

//         done(null, foundUser);
//     } catch (error) {
//         done(error);
//     }
// }));

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    let Err;
    try {
        email = email.toLowerCase();

        // Find user with given email
        const foundUser = await driverModel.findOne({ $or: [{ email: email }, { codeContactNumber: email }, { contactNumber: email }] }, secureUser);
        // If not , handle it
        if (!foundUser) {
            Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
            Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
            return done(Err);
        }

        // Check if the password is correct
        const isMatch = await foundUser.isValidPassword(password);

        // If not, handle it
        if (!isMatch) {
            Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
            Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
            return done(Err);
        }

        done(null, foundUser);
    } catch (error) {
        done(error);
    }
}));

// LOCAL strategy to extract and verify user name and password from request
passport.use('admin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    let Err;
    try {
        email = email.toLowerCase();
        // Find user with given email
        const foundAdmin = await adminModel.findOne({ email }, secureUser);
        
        if (!foundAdmin) {
            Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
            Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
            return done(Err);
        }

        // Check if the password is correct
        const isMatch = await foundAdmin.isValidPassword(password);

        // If not, handle it
        if (!isMatch) {
            /*Err = new Error(LOGIN.INVALID_PASSWORD.message);
             Err.status = LOGIN.INVALID_PASSWORD.httpCode;*/
            Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
            Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
            return done(Err);
        }

        if (!foundAdmin.status) {
            Err = new Error(LOGIN.ACCOUNT_NOT_VERIFIED.message);
            Err.status = LOGIN.ACCOUNT_NOT_VERIFIED.httpCode;
            return done(Err);
        }

        done(null, foundAdmin);
    } catch (error) {
        done(error);
    }
}));

passport.use('jwt-admin', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: config.JWT_ACCESS_TOKEN_SECRET,
    passReqToCallback: true
}, async (req, payload, done) => {
    try {
        const admin = await adminModel.findById(payload.sub, secureUser);

        // If user doesn't exists, handle it
        if (!admin) {
            let Err = new Error(LOGIN.INVALID_TOKEN.message);
            Err.status = LOGIN.INVALID_TOKEN.httpCode;
            return done(Err)
        }

        return done(null, admin);
    } catch (error) {
        return done(error, false);
    }
}));



module.exports = {
    passportJWT: async (req, res, next) => {
        await passport.authenticate('jwt', { session: false }, function (err, user, info) {
            if (info && info.name === 'Error') {
                let Err = new Error(LOGIN.TOKEN_NOT_FOUND.message);
                Err.status = LOGIN.TOKEN_NOT_FOUND.httpCode;
                return next(Err);
            }
            // if (info && info.name === 'TokenExpiredError') {
            //     let Err = new Error(LOGIN.TOKEN_EXPIRED.message);
            //     Err.status = LOGIN.TOKEN_EXPIRED.httpCode;
            //     Err.reason = 'token_expired';
            //     return next(Err);
            // }
            if (info && info.name === 'JsonWebTokenError') {
                let Err = new Error(LOGIN.INVALID_TOKEN.message);
                Err.status = LOGIN.INVALID_TOKEN.httpCode;
                Err.reason = 'invalid_token';
                return next(Err);
            }

            if (err) {
                return next(err);
            }
            if (!user) {
                let Err = new Error(LOGIN.USER_NOT_FOUND.message);
                Err.status = LOGIN.USER_NOT_FOUND.httpCode;
                return next(Err);
            }
            req.user = user;
            next();
        })(req, res, next)
    },
    passportSignIn: async (req, res, next) => {

        await passport.authenticate('local', { session: false }, function (err, user, info) {

            if (info && info.hasOwnProperty('message')) {
                //triggers if "usernameField" field is missing
                let Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
                Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
                return next(Err);
                // return next( new Error(info.message) )//returns 'Missing credentials.'
            }
            if (err) {
                return next(err);
            }
            if (!user) {// if user is not returned by passport package
                let Err = new Error(LOGIN.USER_NOT_FOUND.message);
                Err.status = LOGIN.USER_NOT_FOUND.httpCode;
                return next(Err);
            }
            req.user = user;
            next();
        })(req, res, next)
    },

    adminSignIn: async (req, res, next) => {

        await passport.authenticate('admin', { session: false }, function (err, admin, info) {

            if (info && info.hasOwnProperty('message')) {
                //triggers if "usernameField" field is missing
                let Err = new Error(LOGIN.CREDENTIAL_NOT_FOUND.message);
                Err.status = LOGIN.CREDENTIAL_NOT_FOUND.httpCode;
                return next(Err);
                // return next( new Error(info.message) )//returns 'Missing credentials.'
            }

            if (err) {
                return next(err);
            }

            if (!admin) {// if user is not returned by passport package
                let Err = new Error(LOGIN.USER_NOT_FOUND.message);
                Err.status = LOGIN.USER_NOT_FOUND.httpCode;
                return next(Err);
            }

            // req.session.userId = admin._id;
            req.user = admin;
            next();
        })(req, res, next)

    },
    adminJWT: async (req, res, next) => {
        await passport.authenticate('jwt-admin', { session: true }, function (err, admin, info) {

            if (info && info.name === 'Error') {
                let Err = new Error(LOGIN.TOKEN_NOT_FOUND.message);
                Err.status = LOGIN.TOKEN_NOT_FOUND.httpCode;
                return next(Err);
            }
            // if (info && info.name === 'TokenExpiredError') {
            //     let Err = new Error(LOGIN.TOKEN_EXPIRED.message);
            //     Err.status = LOGIN.TOKEN_EXPIRED.httpCode;
            //     Err.reason = 'token_expired';
            //     return next(Err);
            // }
            if (info && info.name === 'JsonWebTokenError') {
                let Err = new Error(LOGIN.INVALID_TOKEN.message);
                Err.status = LOGIN.INVALID_TOKEN.httpCode;
                Err.reason = 'invalid_token';
                return next(Err);
            }
            if (err) {
                return next(err);
            }
            if (!admin) {
                let Err = new Error(LOGIN.USER_NOT_FOUND.message);
                Err.status = LOGIN.USER_NOT_FOUND.httpCode;
                return next(Err);
            }
            req.user = admin;
            next();
        })(req, res, next)
    },

    // workaround logout for issue in production
    passportJWTLogout: async (req, res, next) => {
        await passport.authenticate('jwt', { session: false }, function (err, user, info) {
            if (info && info.name === 'Error') {
                let Err = new Error(LOGIN.TOKEN_NOT_FOUND.message);
                Err.status = LOGIN.TOKEN_NOT_FOUND.httpCode;
                return next(Err);
            }
            if (info && info.name === 'JsonWebTokenError') {
                let Err = new Error(LOGIN.INVALID_TOKEN.message);
                Err.status = LOGIN.INVALID_TOKEN.httpCode;
                Err.reason = 'invalid_token';
                return next(Err);
            }

            if (err) {
                return next(err);
            }
            next();
        })(req, res, next)
    },

};
