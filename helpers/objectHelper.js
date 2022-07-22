const moment = require('moment');
const { ObjectId } = require('./objectIdHelper');

module.exports = {
    isBusinessOpen: function (settings) {
        let whichDayIsToday = moment(new Date()).day();
        let isOpen;

        let businessHoursOnThatDay = settings.businessHours.lunch.find(o => o.period === whichDayIsToday);
        if (businessHoursOnThatDay) {
            if (businessHoursOnThatDay.isClosed === true) {
                isOpen = false;
            } else {
                let openTime = businessHoursOnThatDay.openTime;
                let closeTime = businessHoursOnThatDay.closeTime;

                let openArr = openTime.split(":");
                let openDate = new Date();

                let closedArr = closeTime.split(":");
                let closeDate = new Date();

                openDate.setHours(parseInt(openArr[0], 10));
                openDate.setMinutes(openArr[1])

                closeDate.setHours(parseInt(closedArr[0], 10));
                closeDate.setMinutes(closedArr[1])

                isOpen = moment(new Date()).isBetween(moment(openDate), moment(closeDate));
            }
        } else {
            isOpen = false;
        }

        let todaysBusinessHours = {
            "period": whichDayIsToday,
            "day": businessHoursOnThatDay.day,
            "openTime": businessHoursOnThatDay.openTime,
            "closeTime": businessHoursOnThatDay.closeTime,
            "isClosed": businessHoursOnThatDay.isClosed,
            "isBusinessOpen": isOpen
        }

        return todaysBusinessHours;



    },
    ObjectIds: function (objectIdArray) {
        let objectIds = [];
        for (let i = 0; i < objectIdArray.length; i++) {
            objectIds.push(ObjectId(objectIdArray[i]))
        };

        return objectIds;
    },
    booleanHelper: function (stringBooleanVal) {
        if (stringBooleanVal == 'true') {
            return true;
        }
        return false;
    }
}