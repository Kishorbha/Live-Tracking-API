const Joi = require('joi')
const moment = require('moment')

module.exports.extractDateOnly = function (Joi) {
    return {
        name: 'date',
        base: Joi.date(),
        language: {
            extractDateOnly: `must be a valid date, (e.g.): yyyy-MM-ddTHH:mm:ss.SSSZ`,
        },
        rules: [
            {
                name: 'extractDateOnly',
                validate(params, value, state, options) {
                    try {
                        let dateValue = new Date(value)
                        dateValue.setUTCHours(0, 0, 0, 0)
                        value = dateValue
                    } catch (e) {
                        //
                    }
                    return value
                },
            },
        ],
    }
}
