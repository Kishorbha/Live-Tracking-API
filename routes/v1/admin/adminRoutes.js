
const router = require('express-promise-router')();

const { loadAdminController } = require(`../loadController`);
const { loadMiddleware } = require(`../loadMiddleware`);

const { adminJWT } = loadMiddleware('auth/passport');
const { validateBody } = loadMiddleware('route/validator');
const { validationSchemas } = loadMiddleware('validatorSchema/adminValidation');
const adminController = loadAdminController('adminController');

router.route('/changePassword').post(adminJWT, validateBody(validationSchemas.changePassword, { abortEarly: true }), adminController.changePassword);

module.exports = router;
