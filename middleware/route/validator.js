const joi = require('joi');
const httpStatusCode = require('http-status-codes');

const buildUsefulErrorObject = (errors) => {
	let errorMessage = "";

	errors.map((error) => {
		//replace white space and slashes
		let messageError = `${error.message.replace(/['"]/g, '')}`;
		errorMessage += errorMessage ? "\n" : "";
		if (!errorMessage.endsWith('?') && !errorMessage.endsWith('!')) {
			errorMessage += `${messageError}.`;
		}
	});

	return errorMessage;
};

module.exports = {

	validateBody: (schema, opt) => {
		return (req, res, next) => {
			const options = opt || { abortEarly: false };
			const result = joi.validate(req.body, schema, { ...options, allowUnknown: true });

			if (result.error) {
				const errors = result.error ? buildUsefulErrorObject(result.error.details) : null;
				console.log('validation error', errors);
				let Err = new Error(errors);
				Err.status = httpStatusCode.UNPROCESSABLE_ENTITY;
				return next(Err);
				/*console.log(req.body)
				return res.status(httpStatusCode.UNPROCESSABLE_ENTITY).json({
					message:errors,
					data: {}
				});*/
			}

			if (!req.value) { req.value = {}; }
			req.value['body'] = result.value;
			req.body = { ...req.body, ...result.value };
			next();
		}
	},

	validateQuery: (schema) => {
		return (req, res, next) => {
			const options = { abortEarly: false };
			const result = joi.validate(req.query, schema, options);

			if (result.error) {
				const errors = result.error ? buildUsefulErrorObject(result.error.details) : null;
				console.log('validation error', errors);
				let Err = new Error(errors);
				Err.status = httpStatusCode.UNPROCESSABLE_ENTITY;
				return next(Err);
				/*console.log(req.body)
				return res.status(httpStatusCode.UNPROCESSABLE_ENTITY).json({
					message:errors,
					data: {}
				});*/
			}

			if (!req.value) { req.value = {}; }
			req.value['query'] = result.value;
			req.query = { ...req.query, ...result.value };
			next();
		}
	},

	requireJsonContent: (req, res, next) => {

		let contentType = req.headers['content-type'] || '';
		contentType = contentType.toLowerCase();
		let isJson = contentType.indexOf('application/json');

		if (isJson === 0) {
			next();
		} else {
			res.status(httpStatusCode.BAD_REQUEST).json({
				status: httpStatusCode.BAD_REQUEST,
				message: `Bad Request.Server requires application/json got ${req.headers['content-type']}`,
				data: {}
			});
		}
	}

};
