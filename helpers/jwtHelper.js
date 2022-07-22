const jwt = require('jsonwebtoken');
const { LOGIN } = require('../constants/lang');

const validateToken = async args => {
    return new Promise((resolve, reject) => {
        jwt.verify(...args, async function (error, decoded) {
            if (error) {
                /*
                  error = {
                    name: 'NotBeforeError',
                    message: 'jwt not active',
                    date: 2018-10-04T16:10:44.000Z
                  }
                */
                let Err = null;
                if (error.name === 'TokenExpiredError') {
                    Err = new Error(LOGIN.TOKEN_EXPIRED.message);
                    Err.status = LOGIN.TOKEN_EXPIRED.httpCode;
                    Err.reason = error.name;
                } else {
                    Err = new Error(error.message);
                    Err.status = 500;
                    Err.reason = undefined;
                }
                return reject(Err);
            } else {
                resolve(decoded);
            }
        });
    });
};
module.exports = {
    validateToken,
};
