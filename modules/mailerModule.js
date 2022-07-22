let nodeMailer = require('nodemailer');
let hbs = require('nodemailer-express-handlebars');
let path = require('path');
let options = {
    viewEngine: {
        extname: '.hbs',
        layoutsDir: path.resolve(__dirname, '../views/emailTemplates '),
        defaultLayout: null,
        partialsDir: path.resolve(__dirname, '../views/emailTemplates/partials'),
    },
    viewPath: path.resolve(__dirname, '../views/emailTemplates'),
    partialsDir: path.resolve(__dirname, '../views/emailTemplates/partials'),
    extname: '.hbs'
};
const config = require('../config');

let emailConfig = {
    service: 'gmail',
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
}

// STEP 1
let mailerTransporter = nodeMailer.createTransport(emailConfig);
mailerTransporter.use('compile', hbs(options));

let emailContextVariable = {
    facebookIconLink: (process.env.CDN || '') + process.env.MAIL_IMAGE_FB || '',
    instagramIconLink: (process.env.CDN || '') + process.env.MAIL_IMAGE_INSTAGRAM || '',
    facebookLink: process.env.FACEBOOK_LINK,
    instagramLink: process.env.INSTAGRAM_LINK,
    welcomeHeaderBgLink: process.env.LOGO_LINK,
    ...config.siteInformation,
};
class mailerService {
    constructor() {
    }

    static async triggerEmail(emailObj) {
        return new Promise((resolve, reject) => {
            // STEP 3
            mailerTransporter.sendMail({
                from: 'eellc123@gmail.com',
                to: emailObj.emailTo,
                subject: emailObj.subject || 'No Subject',
                template: emailObj.templateName || 'verificationTemplate',
                // 
                text: "IT works"
            }, async function (error, info) {
                if (error) {
                    reject(error)
                } else {
                    console.log("email sent")
                    resolve(info);
                }
            });
        });

    }
}

module.exports = mailerService;


