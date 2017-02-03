
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

const MembershipStatus = Constants.MembershipStatus;

// Model
var schema = {

    //membershipId: {type: String, required: false, unique: true, default: uuid.v4()},
    membershipId: {type: Number, required: false},
    subscriptionType: {type: String, required: true},
    validity: {type: Number, required: true},

    userFees: {type: Number, required: true},
    securityDeposit: {type: Number, required: true},
    smartCardFees: {type: Number, required: true},
    processingFees: {type: Number, required: true},

    farePlan: {type: Schema.ObjectId, required: true, ref: "FarePlan"},

    status: {type: MembershipStatus, required: true, default: MembershipStatus.ACTIVE},
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
var Membership = mongoose.model('Membership', model, 'membership');

model.plugin(autoIncrement.plugin,{model:Membership,field:'membershipId',startAt: 1, incrementBy: 1});

module.exports = Membership;