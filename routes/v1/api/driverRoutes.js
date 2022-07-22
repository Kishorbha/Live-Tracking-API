const router = require("express-promise-router")()
const { loadApiController } = require(`../loadController`)
const { loadMiddleware } = require(`../loadMiddleware`)
const { adminJWT } = loadMiddleware("auth/passport")
const driverController = loadApiController("driverController")
const { grantAccess } = require("../../../middleware/auth/roleValidation")
const { requireJsonContent, validateBody } = loadMiddleware("route/validator")
const { validationSchemas } = loadMiddleware("validatorSchema/driverValidation")
const { passportSignIn, passportJWT, passportJWTLogout } =
  loadMiddleware("auth/passport")

router
  .route("/login")
  .post(
    requireJsonContent,
    validateBody(validationSchemas.loginSchema, { abortEarly: true }),
    passportSignIn,
    driverController.signIn
  )

router
  .route("/changePassword")
  .post(
    requireJsonContent,
    validateBody(validationSchemas.changePassword, { abortEarly: true }),
    passportJWT,
    driverController.changePassword
  )

router
  .route("/changeTruckStatusAndLocation/:truckId")
  .patch(
    requireJsonContent,
    validateBody(validationSchemas.truckStatusAndLocationUpdateForDriver, {
      abortEarly: true,
    }),
    passportJWT,
    driverController.updateTruckStatusAndLocation
  )

router
  .route("/truckList")
  .get(passportJWT, driverController.listTrucksAndItsStatus)

router.route("/truckList/:truckId").get(passportJWT, driverController.getTruck)

router.route("/logout").post(passportJWTLogout, driverController.logOut)

// TODO: routes for notification

router
  .route("/registrationToken")
  .post(passportJWT, driverController.saveRegistrationToken)

module.exports = router
