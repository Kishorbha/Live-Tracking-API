const mongoose = require('mongoose');
const { ObjectId } = require('../helpers/objectIdHelper');
const { regex } = require('../helpers/stringHelper');
const { CHAT_NOTIFICATION } = require('../constants/db');
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const templatesSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    slug: { type: String, required: true },
    type: { type: String, default: 1 },
    status: { type: Boolean, default: true },
    locale: { type: String, required: true, default: 'en' },
    locked: { type: Boolean, default: false },
}, {
    // autoCreate: true,
    timestamps: true,
    collation: { locale: 'en_US', strength: 1, numericOrdering: true }
});

templatesSchema.plugin(mongoosePaginate);
templatesSchema.plugin(mongooseAggregatePaginate);

templatesSchema.statics.getBySlug = async function (slug) {

    return await this.findOne({ slug: slug });
};

templatesSchema.statics.parseContent = async function (content, variables) {

    for (let key in variables) {
        let regex = new RegExp('<@' + key + '>', "gi");
        content = content.replace(regex, `${variables[key]}`);
    }

    return content;
};

templatesSchema.statics.getContent = async function (slug, variables = []) {

    let template = await this.getBySlug(slug);
    if (!template) {
        console.log(`template not found for slug : ${slug}`);
        return false;
    }
    let response = {};
    response.body = await this.parseContent(template.body, variables);
    response.title = template.title || '';// await this.parseContent(template.title,variables);

    return response;

};

templatesSchema.statics.getTemplates = function (options) {
    options = options || {};
    let query = {
        $match: {

        }
    };
    if (options.search) {
        query = {
            $match: {
                $or: [
                    {
                        locale: {
                            $regex: options.search,
                            $options: 'i'
                        }
                    },
                    {
                        title: {
                            $regex: options.search,
                            $options: 'i'
                        }
                    },
                    {
                        body: {
                            $regex: options.search,
                            $options: 'i'
                        }
                    },
                    {
                        slug: {
                            $regex: options.search,
                            $options: 'i'
                        }
                    }
                ],
            }
        }
    }

    return this.aggregate([
        {
            $lookup: {
                from: 'languages',
                localField: 'locale',
                foreignField: 'locale',
                as: 'realLanguage'
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                body: 1,
                locale: "$realLanguage.name",
                type: 1,
                status: 1,
                slug: 1,
            }
        },
        {
            $unwind: {
                path: "$locale"
            }
        },
        query,
    ]);
};

templatesSchema.statics.getTemplateByLocale = function (locale = 'en') {
    return this.aggregate([
        {
            $match: {
                locale,
                status: true
            }
        },
        {
            $project: {
                _id: 1,
                title: 1,
                body: 1,
                slug: 1,
                locale: 1,
                type: 1,
                locked: 1,
                status: 1
            }
        }
    ]);
};

templatesSchema.statics.createOrUpdateTemplates = async function (messageObject, targetLocale, translatedMessage) {
    const { slug, type, status, locked } = messageObject;
    const { title, body } = translatedMessage;

    return await this.updateOne(
        {
            locale: targetLocale,
            slug
        },
        {
            title: title,
            body: body,
            type: type,
            status: status,
            locked: locked || false
        },
        {
            upsert: true,
        }
    ).exec();
};

templatesSchema.statics.editTemplate = async function (templateId, data) {
    const { locale } = data;
    let dataSet = data;

    if (locale !== 'en')
        dataSet = { ...data, ...{ locked: true } };

    return await this.updateOne(
        {
            _id: templateId,
        },
        {
            $set: dataSet
        }
    ).exec();
};

templatesSchema.statics.getDynamicTemplate = async function (searchCriteriaObject, locale = null) {
    let searchCriteria = {};
    if (searchCriteriaObject.id)
        searchCriteria = { ...searchCriteria, ...{ _id: ObjectId(searchCriteriaObject.id) } };

    if (searchCriteriaObject.locale)
        searchCriteria = { ...searchCriteria, ...{ locale: searchCriteriaObject.locale } };

    if (searchCriteriaObject.slug)
        searchCriteria = { ...searchCriteria, ...{ slug: searchCriteriaObject.slug } };

    return this.aggregate([
        { $match: searchCriteria }
    ]);
};
templatesSchema.statics.getMessageType = function (messageType, content) {
    switch (messageType) {
        case '10':
        case 10:
            return { type: content || 'Message' };
        case '11':
        case 11:
            return { type: '\uD83D\uDD17 Link' };
        case '20':
        case 20:
            return { type: '\uD83D\uDCF7 Image' };
        case '30':
        case 30:
            return { type: '\uD83D\uDCF7 GIF' };
        case '40':
        case 40:
            return { type: '\uD83D\uDCF7 Sticker' };
        case '50':
        case 50:
            return { type: '\uD83C\uDF9E Video' };
        case '60':
        case 60:
            return { type: '\uD83C\uDFA4 Audio' };
        case '70':
        case 70:
            return { type: '\uD83D\uDCCD Location' };
        case '80':
        case 80:
        default:
            return { type: '\uD83D\uDCC1 Attachment' };
    }
};

templatesSchema.statics.getMessageTemplate = async function (slug, sourceType, message) {
    let template = await this.getBySlug(slug);
    if (!template) {
        console.log(`template not found for slug : ${slug}`);
        return false;
    }

    let { groupName, senderName, contentType, content } = message;
    let messageType = this.getMessageType(contentType, content);

    let response = {
        body: await this.parseContent(template.body, { groupName, senderName, messageType: messageType.type || '' }),
        title: template.title || ''
    };

    //show group name or sender on title
    response.title = sourceType === 2 ? groupName || 'G' : senderName || 'S';

    return response;
};

module.exports = mongoose.model('templates', templatesSchema);
