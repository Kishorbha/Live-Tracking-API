const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('./config');
const passport = require('passport');

const expressSanitizer = require('express-sanitizer');
const expHandelbars = require('express-handlebars');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const performCron = require('./cron');

const path = require('path');
const admins = require('./models/admins');
const JWT = require('jsonwebtoken');
global.APP_PATH = __dirname;
global.PUBLIC_PATH = path.join(__dirname, 'public/');
global.BAXTA_CONFIG = config;

const app = express();
app.use(passport.initialize());

mongoose.set('useFindAndModify', false);
// The `useMongoClient` option is no longer necessary in mongoose 5.x, so remove it.
mongoose.connect(config.dbConfig.uri, config.dbConfig.options).then((client) => {
    global.db = mongoose.connection.db;
    global.client = client;

    console.log('we\'re connected to the database!');
}).catch((error) => {
    console.log('connection error:', error.message);
    process.exit();
});

// Create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the express.static
app.use('/static', express.static(path.join(__dirname, 'public')));


// parse application/json
app.use(bodyParser.json({ limit: '10mb' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Mount express-sanitizer
app.use(expressSanitizer()); // this line follows bodyParser() instantiations

app.use(fileUpload());

app.use(async (req, res, next) => {
    if (req.headers["x-access-token"]) {
        const accessToken = req.headers["x-access-token"];
        const { userId, exp } = await JWT.verify(accessToken, process.env.JWT_SECRET);
        // Check if token has expired
        // if (exp < Date.now().valueOf() / 1000) {
        //     return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
        // }
        res.locals.loggedInUser = await admins.findById(userId); next();
    } else {
        next();
    }
});

app.use(
    cors({
        exposedHeaders: 'accessToken,refreshToken,expiresIn,tempToken,expires_in,webSessionId',
    })
);

const hbs = expHandelbars.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    helpers: require('./helpers/handlebars')
});


app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');





app.use(function (req, res, next) {
    console.log(`processing ${req.originalUrl}` || null);
    next();
})


require('./routes/v1/adminRoutes')(app);
require('./routes/v1/apiRoutes')(app);

performCron();

const modifiedPath = path.join(__dirname, '../cms');

app.use(express.static(path.join(modifiedPath, 'build')))

// app.get('*', (req, res) => {
//     res.sendFile(path.join(modifiedPath, 'build', 'index.html'))
// })


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log('error has been caught ');
    let err = new Error();
    err.status = 404;
    err.reason = 'not_found';
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    err.status = err.status || 500;
    if (typeof err.message === 'string' && err.message.length > 0) {
        //add full stop if not present
        // err.message = err.message.replace(/([^.])$/, '$1.');
        if (!err.message.endsWith('.') && !err.message.endsWith('?') && !err.message.endsWith('!')) {
            err.message = `${err.message}.`;
        }
    }

    res.status(err.status);
    res.json({
        message: err.message || 'Internal server error.',
        data: {
            reason: err.reason || ''
        }
    });
    console.log(err);
    console.log(`error has been sent:: ${req.method}||${err.status || ''} `, err.message);
});

module.exports = app;
