const router = require('express-promise-router')()
const { loadAdminController } = require(`../loadController`)
const { loadMiddleware } = require(`../loadMiddleware`)
const { adminJWT } = loadMiddleware('auth/passport')
const truckController = loadAdminController('truckController')
const { checkPermission } = require('../../../middleware/auth/roleValidation')
const { requireJsonContent, validateBody } = loadMiddleware('route/validator')
const { validationSchemas } = loadMiddleware('validatorSchema/truckValidation')

router
    .route('/')
    .post(
        adminJWT,
        checkPermission('createAny', 'truck'),
        requireJsonContent,
        validateBody(validationSchemas.createTruckSchema, { abortEarly: false }),
        truckController.create,
    )

router
    .route('/:truckId')
    .patch(
        adminJWT,
        checkPermission('updateAny', 'truck'),
        requireJsonContent,
        validateBody(validationSchemas.createTruckSchema, { abortEarly: false }),
        truckController.edit,
    )

router
    .route('/')
    .get(adminJWT, checkPermission('readAny', 'truck'), truckController.getTrucks)

router.route('/filter').post(adminJWT, checkPermission('readAny', 'filterTruck'), truckController.filterTrucks)

router.route('/countries').get(adminJWT, checkPermission('readAny', 'countries'), truckController.getAllCountries)

router.route('/states').get(adminJWT, checkPermission('readAny', 'states'), truckController.getAllStatesOfACountry)

router.route('/truck-type').get(adminJWT, checkPermission('readAny', 'truckTypes'), truckController.getTruckTypes)

router.route('/box-truck-type').get(adminJWT, checkPermission('readAny', 'boxTruckTypes'), truckController.getBoxTruckTypes)

router.route('/:truckId').get(adminJWT, checkPermission('readAny', 'truck'), truckController.getTruck)

router
    .route('/:truckId')
    .delete(
        adminJWT,
        checkPermission('deleteAny', 'truck'),
        truckController.deleteTruck,
    )
/** Only allowed for admin  and dispatcher */
router
    .route('/changeTruckStatusAndLocation/:truckId')
    .patch(
        adminJWT,
        checkPermission('updateAny', 'truckStatusAndLocation'),
        requireJsonContent,
        validateBody(validationSchemas.truckStatusAndLocation, {
            abortEarly: true,
        }),
        truckController.updateTruckStatusAndLocation,
    )

module.exports = router
