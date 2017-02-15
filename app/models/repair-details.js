/**
 * Created by root on 9/2/17.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Constants = require('../core/constants');

var RepairDetailsSchema = mongoose.Schema({
    repairId:Number,
    repairedDate:{type:Date,required:false,default:Date.now},
    employeeId:{type:Schema.ObjectId,required:false,ref:'user'},
    vehicleId:{type:Schema.ObjectId,required:false,ref:'vehicle'},
    location:{type:Schema.ObjectId,required:false},
    checkList:{type:[String],required:false},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'},
    createdAt:{type:Date,required:false,default:Date.now}

}, { collection : 'repair-details'});


var Repair = mongoose.model('repair-details', RepairDetailsSchema);

RepairDetailsSchema.plugin(abstract);

RepairDetailsSchema.plugin(autoIncrement.plugin,{model:Repair,field:'repairId',startAt: 1, incrementBy: 1});

module.exports = Repair;