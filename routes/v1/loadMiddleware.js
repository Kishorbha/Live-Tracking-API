module.exports = {
    loadMiddleware: (middlewareName) => {
        middlewareName = middlewareName.replace(/^\/|\/$/g, '');
        return require(`${APP_PATH}/middleware/${middlewareName}`);
    }
};
