const cron = require('node-cron');
const notficationService = require('./modules/fcmService');

const performCron = () => {

    console.log('start cron job::::::::::' );

    let task = cron.schedule('*/30 7-21 * * *', async () => {
        console.log('Execting Cron job every 30 mins from 7am to 9pm');
        await notficationService.notifyDrivers();  
    },{
        scheduled: true,
        timezone: "America/Los_Angeles"
    });
    task.start();
}

module.exports = performCron;