const mongoose = require('mongoose');
const { ObjectId } = require('../helpers/objectIdHelper');
const { GEO_JSON_TYPES, NOT_AVAILABLE_TRUCK } = require('../constants/db')
const enumVars = require('../config/enumVariables');
let mongoosePaginate = require('mongoose-paginate-v2');
let mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
const { Schema } = mongoose;
const gt = Object.values(GEO_JSON_TYPES)

const pointSchema = (indexOptions) => {
    return new mongoose.Schema({
        type: {
            type: String,
            enum: gt,
            default: GEO_JSON_TYPES.POINT,
        },
        coordinates: {
            type: [Number, Number],
            default: [],
            ...(indexOptions || {}),
        },
    })
}

const truckSchema = new Schema({
    vehicle: {
        truckNumber: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        vin: {  // VEHICLE IDENTIFICATION NUMBER
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        truckTypes: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'trucktypes', required: true }],
            es_indexed: true,
            es_type: 'text',
        },
        boxTruckTypes: {
            type: mongoose.Schema.Types.ObjectId, ref: 'boxtrucktypes',
            es_indexed: true,
            es_type: 'text',
        },
        liftGate: {
            type: Boolean,
            default: false,
        },
        palletJack: {
            type: Boolean,
            default: false,
        },
        airride: {
            type: Boolean,
            default: false,
        },
        iccbar: {
            type: Boolean,
            default: false,
        },
        hazmat: {
            type: Boolean,
            default: false,
        },
        truckTrackType: {
            type: String,
            enum: ['Horizontal-E', 'Vertical-E'],
            required: false,
        },
        tsa: {
            type: Boolean,
            default: false,
        },
        twic: {
            type: Boolean,
            default: false,
        },
        tankerEndorsement: {
            type: Boolean,
            default: false,
        },
        trueDockHigh: {
            type: Boolean,
            default: false,
        },
        issuedIn: {
            country: {
                type: String,
                trim: true,
                required: true,
            },
            state: {
                type: String,
                trim: true,
                required: true,
            }
        },
        expiration: {
            type: Date,
            trim: true,
            default: null
        },
        nonExpirable: {
            type: Boolean,
            default: false,
        },
        licPictures: [
            {
                type: String,
                trim: true,
                required: false,
                default: null
            }
        ],
        make: {
            type: String,
            trim: true,
            required: true,
            default: null
        },
        model: {
            type: String,
            trim: true,
            required: true
        },
        year: {
            type: Date,
            trim: true,
            required: false,
            default: null
        },
        ownership: {
            type: String,
            trim: true,
            required: true
        },
        payloadUnit: {
            type: String, // pounds 
            enum: enumVars.WEIGHT_TYPE,
            trim: true,
            required: true
        },
        payloadWeight: {
            type: Number,
            required: true,
            default: 0,
        },
        dimensions: {
            width: {
                type: Number,
                required: true,
                default: 0,
            },
            length: {
                type: Number,
                required: true,
                default: 0,
            },
            height: {
                type: Number,
                required: true,
                default: 0,
            }
        },
        dimensionType: {
            type: String,
            enum: enumVars.TRUCK_DIMENSION_TYPE,
            required: true
        },
        pictFront: {
            type: String,
            trim: true,
            required: false
        },
        pictBack: {
            type: String,
            trim: true,
            required: false
        },
        pictLeft: {
            type: String,
            trim: true,
            required: false
        },
        pictRight: {
            type: String,
            trim: true,
            required: false
        },
        pictCargo: {
            type: String,
            trim: true,
            required: false
        },
        dockHeightInInches: {
            type: Number,
            required: true,
            default: 0,
        },
        vanModified: {
            type: Boolean,
            default: false,
        },
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'driver',
        required: true,
        unique: true
    },
    team: {
        type: Boolean,
        default: false,
    },
    alternativeDrivers: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'driver' }],
        es_indexed: true,
        es_type: 'text',
        default: []
    },
    status: {
        type: Number,
        enum: [enumVars.TRUCK_STATUS],
        default: NOT_AVAILABLE_TRUCK,
        required: false,
    },
    locationStationed: pointSchema({ index: '2dsphere', es_type: 'geo_point' }),
    currentLocation: {
        type: String,
        trim: true,
        required: false,
        default: null
    },
    bookedFrom: {
        type: Date,
        default: null
    },
    bookedTo: {
        type: Date,
        default: null
    },
    lastSyncedDate: {
        type: Number,
        default: 0
    },
    truckHoldExpiresIn: { type: Number, default: 0 },
},
    {
        autoCreate: true,
        timestamps: true,
        collation: { locale: 'en_US', strength: 1 }
    }
);

truckSchema.plugin(mongoosePaginate);
truckSchema.plugin(mongooseAggregatePaginate);





truckSchema.statics.listTrucksByDriverId = function (driverId) {
    let query = {
        $match: {
            $and: [
                { driver: { $eq: ObjectId(driverId) } },
            ]
        },
    }

    return this.aggregate([
        query,
        {
            $lookup: {
                from: 'drivers',
                as: 'driver',
                let: { driver: '$driver' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$driver'],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            "firstName": "$info.firstName",
                            "lastName": "$info.lastName",
                            "documents": "$documents"
                        }
                    }
                ],
            },
        },
        {
            $lookup: {
                from: 'trucktypes',
                as: 'trucktypes',
                let: { trucktypes: '$vehicle.truckTypes' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ['$_id', '$$trucktypes'],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            description: 1
                        }
                    }
                ],
            },
        },
        {
            $lookup: {
                from: 'boxtrucktypes',
                as: 'boxtrucktypes',
                let: { boxtrucktypes: '$vehicle.boxTruckTypes' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$_id', '$$boxtrucktypes'],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            description: 1
                        }
                    }
                ],
            },
        },
        {
            $project: {
                driver: { $ifNull: [{ $arrayElemAt: ['$driver', 0] }, null] },
                status: 1,
                vehicle: {
                    "vin": '$vehicle.vin',
                    "make": "$vehicle.make",
                    "model": "$vehicle.model",
                    "ownership": "$vehicle.ownership",
                    "pictFront": "$vehicle.pictFront",
                    "pictBack": "$vehicle.pictBack",
                    "pictLeft": "$vehicle.pictLeft",
                    "pictRight": "$vehicle.pictRight",
                    "pictRight": "$vehicle.pictRight",
                    "truckNumber": "$vehicle.truckNumber",
                    "truckTypes": "$trucktypes",
                    "boxTruckTypes": "$boxtrucktypes"
                },
                bookedFrom: 1,
                bookedTo: 1,
                currentLocation: 1,
                truckHoldExpiresIn: 1,
                lastSyncedDate:1,
                locationStationed: 1

            },
        },
    ])
}

const truckModel = mongoose.model('trucks', truckSchema);
module.exports = truckModel;
