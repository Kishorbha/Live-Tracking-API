const randomString = require('randomstring')
const driverModel = require('../models/driver')

module.exports = {
    uniqueDriverCode: async () => {
        let driverCode,
            usedCode = true
        do {
            driverCode = 'Doubblellc@' + await randomString
                .generate({
                    length: 6,
                    charset: '0123456789',
                })
                .toString()
            usedCode = await driverModel.countDocuments({ driverCode })
        } while (usedCode)
        return driverCode
    },
}
