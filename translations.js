
const translationMessageModel = require('./models/translatedMessages');

export function translateResponseMessage(req, res, next) {
    let json = res.json;
    res.json = async function (jsonObj) {
        try {
            let message = jsonObj.message || '';
            if (typeof message === 'string' && message.length > 0 && message !== 'SUCCESS') {
                let translated = await translationMessageModel.findOne({ locale: 'en', originalMessage: jsonObj.message }).exec();
                jsonObj.message = translated.message || jsonObj.message;
            }
        } catch (e) {
            console.log('Unable to translate response message::', e.message || '');
        }
        await json.call(this, jsonObj);
    };
    next();
}
