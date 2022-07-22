const router = require('express-promise-router')()
const { loadAdminController } = require(`../loadController`)
const { loadMiddleware } = require(`../loadMiddleware`)
const { adminJWT } = loadMiddleware('auth/passport')
const driverController = loadAdminController('driverController')
const {
    checkPermission,
} = require('../../../middleware/auth/roleValidation')
const { requireJsonContent, validateBody } = loadMiddleware('route/validator')
const { validationSchemas } = loadMiddleware('validatorSchema/driverValidation')


router
    .route('/')
    .post(
        adminJWT,
        checkPermission('createAny', 'driver'),
        requireJsonContent,
        validateBody(validationSchemas.createDriverSchema, { abortEarly: true }),
        driverController.create,
    )

router
    .route('/:driverId')
    .patch(
        adminJWT,
        checkPermission('updateAny', 'driver'),
        requireJsonContent,
        validateBody(validationSchemas.createDriverSchema, { abortEarly: true }),
        driverController.edit,
    )

router
    .route('/')
    .get(
        adminJWT,
        checkPermission('readAny', 'driver'),
        driverController.getDrivers,
    )

router
    .route('/:driverId')
    .get(
        adminJWT,
        checkPermission('readAny', 'driver'),
        driverController.getDriver,
    )

router
    .route('/:driverId')
    .delete(
        adminJWT,
        checkPermission('deleteAny', 'driver'),
        driverController.deleteDriver,
    )

module.exports = router
