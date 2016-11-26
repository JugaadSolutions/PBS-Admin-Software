/**
 * Created by root on 15/11/16.
 */
var mongoose = require('mongoose');
//bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Constants = require('../core/constants');


var DepositSchema = mongoose.Schema({
    depositUid: Number,
    cashCollectionDate:{type:Date,required:false},
    regCentreName:{type:String,required:false},
    depositDate:{type:Date,required:false},
    amount:{type:Number,required:true},
    bankName:{type:String,required:false},
    branch:{type:String,required:false},
    transactionId:{type:String,required:false},
    remarks:{type:String,required:false},
    depositedBy:{type:String,required:false},
    createdBy:{type:String,required:false}
}, { collection : 'deposits'});


var Deposits= mongoose.model('deposits', DepositSchema);

DepositSchema.plugin(abstract);

DepositSchema.plugin(autoIncrement.plugin,{model:Deposits,field:'depositUid',startAt: 1, incrementBy: 1});

module.exports = Deposits;