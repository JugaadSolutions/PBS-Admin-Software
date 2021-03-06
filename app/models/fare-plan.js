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

const FarePlanStatus = Constants.FarePlanStatus;

// Nested model
var Plans = {
    startTime: {type: Number, required: true},
    endTime: {type: Number, required: true},
    fee: {type: Number, required: true}
};

// Model
var schema = {

    //farePlanId: {type: String, required: false, unique: true, default: uuid.v4()},
    fareplanUid:Number,
    planName: {type: String, required: true, unique: true},
    plans: {type: [Plans], required: true},
    status: {type: FarePlanStatus, required: true, default: FarePlanStatus.ACTIVE},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'},
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

        doc.farePlanId = uuid.v4();

    }

    next();

});*/

// Mongoose Model
var FarePlan = mongoose.model('FarePlan', model, 'fare-plan');
model.plugin(autoIncrement.plugin,{model:FarePlan,field:'fareplanUid',startAt: 1, incrementBy: 1});

module.exports = FarePlan;