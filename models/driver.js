const mongoose = require('mongoose');
const bcryptNodeJs = require('bcrypt-nodejs');
const enumVars = require('../config/enumVariables');
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { Schema } = mongoose;
const { getEmail } = require('../helpers/stringHelper');
const { ObjectId } = require('../helpers/objectIdHelper');

const driverSchema = new Schema({
    dateHired: {
        type: Date,
        trim: true,
        required: true
    },
    hiredBy: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    passwordToken: {
        type: String,
        default: null
    },
    passwordTokenExpiry: {
        type: Number,
        default: 0
    },
    info: {
        firstName: {
            type: String,
            trim: true,
            required: true,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
        },
        driverType: {
            type: String, // license type 
            enum: enumVars.DRIVER_LICENSE_TYPE,
            required: true,
        },
        phoneCode: { type: String, default: null },
        countryCode: { type: String, default: null },
        phoneNumber: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        homePhone: {
            type: String,
            required: false,
            default: null,
        },
        dob: {
            type: Date,
            trim: true,
            required: false,
        },
        address: {
            displayAddress: {
                type: String,
                trim: true,
                required: false,
            },
            city: {
                type: String,
                trim: true,
                default: null,
            },
            state: {
                type: String,
                trim: true,
                default: null,
            },
            postalCode: {
                type: String,
                trim: true,
                required: false,
            },
            country: {
                type: String,
                trim: true,
                default: null,
            },
            geometry: {
                coordinates: { type: [Number], index: '2dsphere' },
            },
        },
        emergencyName: {
            type: String,
            trim: true,
            required: false,
        },
        emergencyPhone: {
            type: String,
            trim: true,
            required: false,
            default: null,
        },
        usCitizen: {
            type: Boolean,
            default: false,
        },
        workPermission: {
            type: Boolean,
            default: false,
        },
        dui: {     // DRIVING UNDER THE INFLUENCE
            type: Boolean,
            default: false,
        },
        felonies: {  // CRIMES
            type: Boolean,
            default: false,
        },
        tsa: {   // TRANSPORTATION SECURITY ADMINISTRATION
            type: Boolean,
            default: false,
        },
        hazmat: {  // DANGEROUS SUBSTANCES
            type: Boolean,
            default: false,
        },
    },
    experience: {
        total: {
            type: Number,
            required: false,
        },
        employers: [
            {
                name: {
                    type: String,
                    trim: true,
                    required: false,
                },
                email: {
                    type: String,
                    required: false,
                },
                phoneNumber: {
                    type: String,
                    trim: true,
                    required: false,
                    default: null,
                },
            }
        ],
    },
    documents: {
        licNum: {
            type: String,
            trim: true,
            required: false,
        },
        licIssuedIn: {
            country: {
                type: String,
                trim: true,
                required: false,
            },
            state: {
                type: String,
                trim: true,
                required: false,
            }
        },
        licClass: {
            type: String,
            enum: enumVars.DRIVER_LICENSE_TYPE,
            trim: true,
            required: false,
        },
        licExpiration: {
            type: Date,
            trim: true,
            required: false,
        },
        licNonExpirable: {
            type: Boolean,
            default: false,
        },
        licFrontPictures: [String],
        licBackPictures: [String],
        insExists: {
            type: Boolean,
            default: false,
        },
        insNum: {
            type: Number,
            required: false,
            default: 0,
        },
        insCompany: {
            type: String,
            trim: true,
            required: false,
        },
        insIssuedIn: {
            country: {
                type: String,
                trim: true,
                required: false,
            },
            state: {
                type: String,
                trim: true,
                required: false,
            }
        },

        insFrontPictures: [String],
        insBackPictures: [String],
        insExpiration: {
            type: Date,
            trim: true,
            required: false,
            default: null,
        },
        insRadius: {
            type: Number,
            required: false,
            default: 0,
        },
        insLiability: {
            type: Number,
            required: false,
            default: 0,
        },
        insAutoLiability: {
            type: Number,
            required: false,
            default: 0,
        },
        insCargo: {
            type: Number,
            required: false,
            default: 0,
        },
        insDeductible: {
            type: Number,
            required: false,
            default: 0,
        },
        insNationwide: {
            type: Boolean,
            default: false,
        },
    },
    status: {
        type: Number,
        enum: [enumVars.DRIVER_STATUS],
        default: 1,
    },
    driverCode: { type: String, required: true },
    firstTimeLogInRemaining: {
        type: Boolean,
        default: true,
    },
    isTruckAssociated: {
        type: Boolean,
        default: false,
    },
},
    {
        autoCreate: true,
        timestamps: true
    },
);

driverSchema.methods.isValidPassword = async function (newPassword) {
    try {
        return await bcryptNodeJs.compareSync(newPassword, this.password);
    } catch (error) {
        throw new Error(error.message);
    }
};

driverSchema.statics.generatePassword = async function (password) {
    // Generate a salt
    const salt = await bcryptNodeJs.genSaltSync(10);

    // Generate a password has ( salt + hash )
    return await bcryptNodeJs.hashSync(password, salt);
};

driverSchema.statics.profileById = async function (driverId) {
    return this.findById(ObjectId(driverId), { _id: 1, email: 1, })
};

driverSchema.statics.checkEmailVerifyTokenId = async function (emailVerificationToken, cb) {
    return this.findOne({ emailVerificationId: emailVerificationToken, status: 0 }, cb);
};

driverSchema.statics.checkEmail = async function (email, cb) {
    email = getEmail(email);
    return this.findOne({ email: email }, cb);
};

driverSchema.methods.toJSON = function () {
    var obj = this.toObject()
    delete obj.password
    return obj
}

driverSchema.pre("save", async function (next) {

    this.email = getEmail(this.email);

    const salt = await bcryptNodeJs.genSaltSync(10);

    this.password = await bcryptNodeJs.hashSync(this.password, salt);
    next();
});

driverSchema.statics.getDrivers = function (options) {
    let query = {
        $match: {
            $and: [
                { status: { $in: enumVars.TRUCK_STATUS } },
            ]
        },
    }

    if (typeof options.search === 'string' && options.search.length > 0) {
        query.$match.$and.push({
            $or: [{ "info.firstName": { $regex: options.search, $options: 'i' } }, { "info.lastName": { $regex: options.search, $options: 'i' } }, { "email": { $regex: options.search, $options: 'i' } }],
        })
    }

    let stages = [query];

    stages.push({
        $sort: {
            createdAt: -1
        }
    })

    if (typeof options.retriveNameOnly === 'string' && options.retriveNameOnly.length > 0) {
        stages.push({
            $project: {
                _id: 1,
                "firstName": '$info.firstName',
                "lastName": "$info.lastName"
            }
        })

    };

    return this.aggregate(stages)
}


driverSchema.plugin(mongoosePaginate);
driverSchema.plugin(mongooseAggregatePaginate);

const driverModel = mongoose.model('driver', driverSchema);
module.exports = driverModel;
