
const JWT = require('jsonwebtoken');
const {
    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET,
    JWT_ACCESS_TOKEN_LIFE,
    JWT_REFRESH_TOKEN_LIFE,
    JWT_TEMP_TOKEN_SECRET
} = require('../config');

module.exports = {
    signAccessToken: async (user) => {
        let expiresIn = JWT_ACCESS_TOKEN_LIFE();
        let accessToken = await JWT.sign({
            iss: process.env.JWT_SECRET || 'can be name or name of our server or app',
            sub: user,
            exp: expiresIn,
            //number of seconds
        }, JWT_ACCESS_TOKEN_SECRET);
        return {
            accessToken,
            expiresIn
        };
    },

    signRefreshToken: (user) => {
        return JWT.sign({
            iss: process.env.APP_NAME || 'can be name or name of our server or app',
            sub: user,
            exp: JWT_REFRESH_TOKEN_LIFE() //milliseconds
        }, JWT_REFRESH_TOKEN_SECRET);
    },
};
