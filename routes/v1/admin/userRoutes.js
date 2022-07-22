const router = require("express-promise-router")()
const { loadAdminController } = require(`../loadController`)
const { loadMiddleware } = require(`../loadMiddleware`)
const { adminJWT } = loadMiddleware("auth/passport")
const userController = loadAdminController("userController")
const { checkPermission } = require("../../../middleware/auth/roleValidation")
const { requireJsonContent, validateBody } = loadMiddleware("route/validator")
const { validationSchemas } = loadMiddleware("validatorSchema/userValidation")

// USERS ROUTE
router
  .route("/")
  .post(
    adminJWT,
    checkPermission("createAny", "user"),
    requireJsonContent,
    validateBody(validationSchemas.registerSchema, { abortEarly: true }),
    userController.createNewUser
  )

router
  .route("/:userId")
  .patch(
    adminJWT,
    checkPermission("updateAny", "user"),
    requireJsonContent,
    validateBody(validationSchemas.registerSchema, { abortEarly: true }),
    userController.updateUser
  )

router
  .route("/image")
  .post(
    adminJWT,
    userController.uploadImage,
    checkPermission("createAny", "image")
  )

router
  .route("/")
  .get(adminJWT, checkPermission("readAny", "user"), userController.getUsers)

router
  .route("/:userId")
  .get(adminJWT, checkPermission("readAny", "user"), userController.getUser)

router
  .route("/:userId")
  .delete(
    adminJWT,
    checkPermission("deleteAny", "user"),
    userController.deleteUser
  )

module.exports = router
