
let credential = process.env.DB_USER && process.env.DB_PASS ? process.env.DB_USER + ':' + process.env.DB_PASS : '';
credential = credential !== '' ? credential : process.env.DB_USER;
credential = credential !== '' ? credential + '@' : '';
let uri = process.env.DB_DRIVER + '://' + credential + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_DATABASE;

module.exports = {
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET || ' secret key for access token ',
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || ' secret key for refresh token ',
    JWT_TEMP_TOKEN_SECRET: process.env.JWT_TEMP_TOKEN_SECRET || 'temp token secret',
    JWT_ACCESS_TOKEN_LIFE: () => {
        return Math.floor(new Date().getTime() / 1000.0) + (process.env.JWT_ACCESS_TOKEN_LIFE || 24 * 365 * 3600); //365 days default
    },
    JWT_REFRESH_TOKEN_LIFE: () => {
        return Math.floor(new Date().getTime() / 1000.0) + (process.env.JWT_REFRESH_TOKEN_LIFE || 365 * 24 * 3600); //365 days default
    },
    CONTACT_VERIFICATION_LIFE_MIN: 2,// minutes
    CONTACT_VERIFICATION_LIFE_MAX: 128,// minutes
    CONTACT_VERIFICATION_LIFE: (minute) => {
        minute = minute || module.exports.CONTACT_VERIFICATION_LIFE_MIN || 2;
        return new Date().getTime() + (minute * 60 * 1000); // exponential value of minute
    },
    HOLD_TRUCK_MINUTES: (minute) => {
        minute = minute || module.exports.CONTACT_VERIFICATION_LIFE_MIN || 15;
        return new Date().getTime() + (minute * 60 * 1000); // exponential value of minute
    },

    dbConfig: {
        uri: process.env.DB_URI || uri,
        options: {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        }
    },
    siteInformation: {
        siteUrl: process.env.SITE_API_URL,
        webUrl: process.env.WEB_URL,
        ios_app_link: process.env.IOS_APP_LINK,
        facebookLink: process.env.FACEBOOK_LINK,
        instagramLink: process.env.INSTAGRAM_LINK,
        linkedInLink: process.env.LINKEDIN_LINK,
        twitterLink: process.env.TWITTER_LINK,
        siteName: process.env.SITE_NAME,
        siteContactNumber: process.env.SITE_CONTACT_NUMBER,
        siteEmail: process.env.SITE_EMAIL
    },
    activeMailer: '',
    apiPerPageLimit: process.env.API_PER_PAGE_LIMIT || 20,


    FCM_SERVER_KEY: process.env.FCM_SERVER_KEY,
    FCM_SENDER_ID: process.env.FCM_SENDER_ID,

    AWS_BUCKET: process.env.AWS_BUCKET || '',
    AWS_REGIONS: process.env.AWS_REGIONS || 'ap-southeast-2',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',

    SERVE_CRON: process.env.SERVE_CRON || false,
    SERVER_KEY: process.env.SERVER_KEY
};
