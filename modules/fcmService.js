const FCM = require('fcm-node');
const deviceModel = require('../models/devices');
const truckModel = require('../models/truck');
const {
    FCM_SERVER_KEY
} = require('../config');

//const serverKey = JSON.parse(process.env.SERVER_KEY);
const moment = require('moment');
class fcmService extends FCM {
   constructor(FCM_SERVER_KEY){
       super(FCM_SERVER_KEY)
   }
    async notifyDrivers() {
        let tokens = await this.getDriverDevices();
        if (!Array.isArray(tokens)) {
            console.log('error here::. not an array');
            return false;
        }
    
        var message = {
            registration_ids: tokens, 
            
            notification: {
                title: 'Remainder', 
                body: 'Your location has not been synced for 2 hours. Please open the application to sync your location.' 
            },
            
        }

        await this.send(message, function (err, response) {
            if (err) {
                console.log('unable to send driver notification :::', err);
            } else {
                console.log('driver notification sent :::', response);
            }
        })
    }

    async getDriverDevices() {
        let notSyncedDriverList = await truckModel.aggregate([
            {
                $match: {
                     $and: [ 
                         { lastSyncedDate:  { $lt:  moment().subtract(120,'minute').valueOf() } }, 
                         {
                             $or: [
                                { status: { $eq: 1 } }, 
                                { status: { $eq: 2 } }
                             ]
                         }
                         ] 
                        } ,
            },
            {
                $project:
                   {
                     driver: 1,
                     status: 1,
                    _id: 0,
                   }
              }
        ])  

        let registeredDevices = await deviceModel.aggregate([
            {
                $match: {
                    driverId: {'$in': notSyncedDriverList.map(item => item.driver) },
                }
            },
            {
                $project: {
                    _id:0,
                    registrationToken: 1,
                    driverId: 1,
                }}
        ])
        return registeredDevices.map(item => item.registrationToken)
    }

}
const fcm = new fcmService(FCM_SERVER_KEY);
module.exports = fcm;
