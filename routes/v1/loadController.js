module.exports = {
    loadApiController: (controllerName) => {
        controllerName = controllerName.replace(/^\/|\/$/g, '');
        const { instance } = require(`${APP_PATH}/controllers/v1/api/${controllerName}`);
        return instance;
    },
    loadAdminController: (controllerName) => {
        controllerName = controllerName.replace(/^\/|\/$/g, '');
        const { instance } = require(`${APP_PATH}/controllers/v1/admin/${controllerName}`);
        return instance;
    }
};
