/**
 * Created by root on 4/3/17.
 */

// Third Party Dependencies
var mongoose = require('mongoose'),
    uuid = require('node-uuid'),
    _ = require('underscore');
var autoIncrement = require('mongoose-auto-increment');
// Application Level Dependencies
var abstract = require('./abstract'),
    Constants = require('../core/constants');

// Mongoose Schema
var Schema = mongoose.Schema;

const Stype = Constants.ServiceChargeType;

const TopupPlanStatus = Constants.TopupPlanStatus;

// Model
var schema = {

    //membershipId: {type: String, required: false, unique: true, default: uuid.v4()},
    topupId: {type: Number, required: false},
    topupName: {type: String, required: true},
    validity: {type: Number, required: true},
    userFees: {type: Number, required: true},
    status: {type: TopupPlanStatus, required: true, default: TopupPlanStatus.ACTIVE},
    createdBy : {type:Schema.ObjectId,required:false,ref:'user'},
    ccserviceCharge:{type:Number,required:false,default:5},
    serviceChargeType:{type:Stype,required:false,default:Stype.FLAT},

    lastSyncedAt:{type:Date,required:false,default:Date.now},
    updateCount:{type: Number, required: false,default:0},
    unsuccessIp:{type:[String],required:false,default:[]},
    successIp:{type:[String],required:false,default:[]}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Hooks
/*model.pre('save', function (next) {

 var doc = this;

 if (doc.isNew) {

 doc.membershipId = uuid.v4();

 }

 next();

 });*/

// Mongoose Model
var Topup = mongoose.model('Topup', model, 'topup');

model.plugin(autoIncrement.plugin,{model:Topup,field:'topupId',startAt: 1, incrementBy: 1});

module.exports = Topup;
