
const router = require('express-promise-router')();

const { route } = require('../../../app');
const { loadAdminController } = require(`../loadController`);
const { loadMiddleware } = require(`../loadMiddleware`);

const { adminSignIn, adminJWT } = loadMiddleware('auth/passport');
const { requireJsonContent, validateBody } = loadMiddleware('route/validator');
const { validationSchemas } = loadMiddleware('validatorSchema/adminValidation');
const guestController = loadAdminController('guestAdminController');

router.route('/register').post(requireJsonContent, validateBody(validationSchemas.registerSchema, { abortEarly: true }), guestController.register);
router.route('/login').post(requireJsonContent, validateBody(validationSchemas.loginSchema, { abortEarly: true }), adminSignIn, guestController.signIn);
router.route('/logout').post(adminJWT, guestController.logOut);

/** these routes ar not used for now */
router.route('/forgotPassword').post(requireJsonContent, validateBody(validationSchemas.forgotPassword, { abortEarly: true }), guestController.forgotPassword);
router.route('/resetPassword').post(requireJsonContent, validateBody(validationSchemas.resetPassword, { abortEarly: true }), guestController.resetPassword);
router.route('/verifyReset').post(guestController.verifyReset);
router.route('/refreshToken').get(guestController.refreshAccessToken);

module.exports = router;
