const mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
const bcryptNodeJs = require('bcrypt-nodejs');
const enumVars = require('../config/enumVariables');
const { Schema } = mongoose;

const { getEmail } = require('../helpers/stringHelper');
const { ObjectId } = require('../helpers/objectIdHelper');
const apiMessage = require('../constants/lang');

const adminSchema = new Schema({
    fullName: { type: String, default: null },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    email: { type: String, required: true, unique: true },
    userName: { type: String, default: null, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: enumVars.userRole, default: 'admin' },
    status: { type: Number, enum: enumVars.userStatus, default: 0 },
    passwordToken: { type: String, default: '' },
    passwordTokenExpiry: { type: Number, default: 0 },
    phoneCode: { type: String, default: null },
    countryCode: { type: String, default: null },
    contactNumber: { type: String, default: null },
    codeContactNumber: { type: String, default: null },
}, {
    autoCreate: true,
    timestamps: true
});

adminSchema.index({
    // fullName: "text",
    firstName: "text",
    lastName: "text",
    email: "text"
});


adminSchema.methods.isValidPassword = async function (newPassword) {
    try {
        return await bcryptNodeJs.compareSync(newPassword, this.password);
    } catch (error) {
        throw new Error(error.message);
    }
};

adminSchema.statics.generatePassword = async function (password) {
    // Generate a salt
    const salt = await bcryptNodeJs.genSaltSync(10);

    // Generate a password has ( salt + hash )
    return await bcryptNodeJs.hashSync(password, salt);

};


adminSchema.statics.checkEmailVerifyTokenId = async function (emailVerificationToken, cb) {
    return this.findOne({ emailVerificationId: emailVerificationToken, status: 0 }, cb);
};

adminSchema.statics.checkUserName = async function (userName, cb) {
    userName = userName.toLowerCase();
    return this.findOne({ userName: userName }, cb);
};

adminSchema.statics.checkEmail = async function (email, cb) {
    email = getEmail(email);
    return this.findOne({ email: email }, cb);
};

adminSchema.statics.profileById = async function (userId) {
    // return this.findById(ObjectId(userId), { _id: 1, email: 1, fullName: 1, role: 1 })
    return this.findById(ObjectId(userId), { _id: 1, email: 1, role: 1 })
};

adminSchema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.password
    return obj
}

adminSchema.pre("save", async function (next) {
    this.userName = this.userName.toLowerCase();
    this.email = getEmail(this.email);

    // const isEmailExist = await this.model('users').findOne({ email: this.email }).exec();
    // if (isEmailExist) {
    //     let error = {};

    //     //Email with the FB sign up already exists.Request for linking with fb account
    //     if (this.status === 1 && isEmailExist.status !== 2) {
    //         error.status = apiMessage.REGISTER.EMAIL_EXIST_FB_REGISTER.httpCode;
    //         error.message = apiMessage.REGISTER.EMAIL_EXIST_FB_REGISTER.message;
    //     }
    //     if (isEmailExist.status === 1) {
    //         error.status = apiMessage.REGISTER.EXIST_EMAIL.httpCode;
    //         error.message = apiMessage.REGISTER.EXIST_EMAIL.message;
    //     }
    //     else if (isEmailExist.status === 0) {
    //         error.status = apiMessage.REGISTER.EMAIL_EXIST_NOT_VERIFIED.httpCode;
    //         error.message = apiMessage.REGISTER.EMAIL_EXIST_NOT_VERIFIED.message;
    //     } else {
    //         error.status = apiMessage.REGISTER.DISABLED_BY_ADMIN.httpCode;
    //         error.message = apiMessage.REGISTER.DISABLED_BY_ADMIN.message;
    //     }
    //     next(error);
    // }
    // const isUserNameExist = await this.model('users').findOne({ userName: this.userName }).exec();
    // if (isUserNameExist) {
    //     var error = {};
    //     error.status = apiMessage.REGISTER.EXIST_USER_NAME.httpCode;
    //     error.message = apiMessage.REGISTER.EXIST_USER_NAME.message;
    //     next(error);
    // }

    const salt = await bcryptNodeJs.genSaltSync(10);

    // Generate a password has ( salt + hash )
    this.password = await bcryptNodeJs.hashSync(this.password, salt);
    next();
});

adminSchema.plugin(mongoosePaginate);
adminSchema.plugin(mongooseAggregatePaginate);

const admins = mongoose.model('admins', adminSchema);
module.exports = admins;
