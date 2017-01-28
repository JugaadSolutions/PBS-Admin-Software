/**
 * Created by root on 16/1/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    Constants = require('../core/constants');
var autoIncrement = require('mongoose-auto-increment');

var UsageSchema = mongoose.Schema({
    usageId: {type: Number, required: true, unique: true},
    createdDate:{type:Date,required:false,default:Date.now},
    reportDate:{type:Date,required:false,default:Date.now},
    noOfTrips: {type: Number, required: false},
    requiredNoOfCycles: {type: Number, required: false},
    totalDuration: {type: Number, required: false},
    tripsPerCycle: {type: Number, required: false},
    durationPerCycle: {type: Number, required: false},
    noOfCyclesUsed: {type: Number, required: false},
    noOfPeopleUsed: {type: Number, required: false}

}, { collection : 'usage-stats' });

var UsageStats = mongoose.model('usage-stat', UsageSchema);

UsageSchema.plugin(abstract);

UsageSchema.plugin(autoIncrement.plugin,{model:UsageStats,field:'usageId',startAt: 1, incrementBy: 1});

module.exports = UsageStats;
