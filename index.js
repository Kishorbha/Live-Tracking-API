const app = require('./app');
const host = process.env.HOST || 'http://localhost';
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    const server = app.listen(port);
    console.log('Server listening at ' + process.env.SITE_API_URL || '', server.timeout, 'Millisecond');
} else {
    const server = app.listen(port, host);
    console.log(`Server listening at ${host}:${port}`, server.timeout, 'Millisecond');
}




