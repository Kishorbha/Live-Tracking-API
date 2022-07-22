/*
Regular expression flags
Flag 	Description
g 	    Global search.
i 	    Case-insensitive search.
m 	    Multi-line search.
s 	    Allows . to match newline characters.
u 	    "unicode"; treat a pattern as a sequence of unicode code points
y 	    Perform a "sticky" search that matches starting at the current position in the target string. See sticky

*/

function setHours(date) {
    return new Date(date.setHours(11));
}

function setMinutes(date) {
    return new Date(date.setMinutes(59));
}

function setSeconds(date) {
    return new Date(date.setSeconds(59));
}

function setSeconds(date) {
    return new Date(date.setSeconds(59));
}

function convert(date) {
    return setHours(setMinutes(setSeconds(date)))
}

function _common(firstArr, secondArr) {
    return firstArr.filter(value => -1 !== secondArr.indexOf(value));
}
function dayInWords(day) {
    switch (day) {
        case 0:
            return 'Sunday'

        case 1:
            return 'Monday'

        case 2:
            return 'Tuesday'

        case 3:
            return 'Wednesday'

        case 4:
            return 'Thursday'

        case 5:
            return 'Friday'

        case 6:
            return 'Saturday'
    }
}

function modifyTime(timeArr) {
    timeArr = timeArr.split('');
    timeArr.splice(2, 0, ":");
    timeArr = timeArr.join("");
    return timeArr.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [timeArr];
}

function convertToTimeMeridian(time) {
    time = time.slice(1);
    time[5] = +time[0] < 12 ? ' AM' : ' PM';
    time[0] = +time[0] % 12 || 12;

    return time;
}
function closedDays(arr) {
    let closedWeekDayText = [];
    for (let data of arr) {
        const day = dayInWords(data)
        closedWeekDayText.push(`${day}: Closed`)
    }
    return closedWeekDayText;

}

function uniqueUserName() {
    return 'Mandala@' + Math.random().toString(36).substr(2, 9);
}


module.exports = {
    regex: function (string) {
        try {
            return new RegExp([string].join(""), "i");
        } catch (e) {
            return new RegExp(["\\" + string].join(""), "i");
        }
    },

    getEmail: function (email) {
        if (!email) return email;
        try {
            return email.toLowerCase();
        } catch (e) {
            return email;
        }
    },

    makeEditorContentResponsive: function (content) {
        //add view port and image class at start of content
        let hasViewPort = content.indexOf('<meta name="viewport"');
        let hasImageClass = content.indexOf('.image');
        content = '<style> @font-face { font-family: "SFUIDisplay-Medium"; src: url("http://petbook.draftserver.com/fonts/sf-ui-display-medium-58646be638f96.woff") format("woff"); }</style>' + content;
        if (content.indexOf('.image') == -1) {
            content = '<style> img{width: 100%;height: auto;}</style>' + content;
        }
        if (content.indexOf('<meta name="viewport"') == -1) {
            content = '<meta name="viewport" content="width=device-width, initial-scale=1">' + content;
        }
        //add video parser tag // API key should change later
        content += '<script charset="utf-8" src="https://cdn.iframe.ly/embed.js?api_key=474eb1e9fba99a1268c35f"></script>';
        content = content + '<script>document.querySelectorAll( \'oembed[url]\' ).forEach( element => {iframely.load( element, element.attributes.url.value );} );</script>';
        return content;
    },

    getPreviousWeekDay: (date) => {
        const first = date.getDate() - date.getDay();
        return new Date(date.setDate(first - 1));
    },

    getFirstLastDayOfWeek: (date) => {
        let first = date.getDate() - date.getDay();
        let last = first + 6;

        first = new Date(date.setDate(first));
        last = new Date(date.setDate(last));
        return {
            firstDay: first,
            lastDay: last
        }
    },

    getPreviousMonthLastDay: (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 0);
    },

    getFirstLastDayOfMonth: (date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

        return {
            firstDay,
            lastDay
        }
    },

    getIndexOfArrayWithCountZero: (objectData, found = false) => {
        let mapped = objectData.map((row, index) => {
            if (row.formattedData.total.count === 0 && !found)
                return index;
            else {
                found = true;
                return -1
            }
        });

        return mapped.filter(data => data !== -1)
    },

    getCommonIndices: (arrays) => {
        let soo = [];
        let multiples = Object.keys(arrays).length > 2;
        for (let i = 1; i < Object.keys(arrays).length; i++) {
            if (multiples && i > 1) {
                soo = _common(soo, Object.values(arrays)[i]);
            } else {
                soo = _common(Object.values(arrays)[i - 1], Object.values(arrays)[i]);
            }
        }

        return soo;
    },

    getSerialNonZeroData: (excludeIndexList, array) => {
        return array.splice(excludeIndexList.length, array.length);
    },

    formatWeekDayText(dayData, startTimeData, closeTimeData) {

        let day = dayInWords(dayData);
        let startTime = modifyTime(startTimeData)
        let closeTime = modifyTime(closeTimeData)

        if (startTime.length > 1 && closeTime.length > 1) {
            startTime = convertToTimeMeridian(startTime);
            closeTime = convertToTimeMeridian(closeTime);

        }
        return `${day}: ` + startTime.join('') + ' - ' + closeTime.join('');
    },


    determineCloseDays(openDaysArr) {
        const allDays = [0, 1, 2, 3, 4, 5, 6];
        const closedDaysArr = allDays.filter(function (v) {
            return !openDaysArr.includes(v);
        })
        return closedDays(closedDaysArr)
    },

    getUniqueUserName() {
        return uniqueUserName();
    },




};

String.prototype.getEmail = function (email) {
    if (typeof email !== 'string') return null;
    return email.toLowerCase();
};

// Hide method from for-in loops
Object.defineProperty(String.prototype, "getEmail", { enumerable: false });
