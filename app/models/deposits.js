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

const Loc=Constants.Loc;

var DepositSchema = mongoose.Schema({
    depositUid: Number,
    cashCollectionDate:{type:Date,required:true,default:Date.now()},
    location:{type:String,required:true},
    //regCentreName:{type:String,required:false},
    depositDate:{type:Date,required:true, default:Date.now()},
    amount:{type:Number,required:true},
    bankName:{type:String,required:true},
    branch:{type:String,required:true},
    transactionId:{type:String,required:false},
    remarks:{type:String,required:false},
    depositedBy:{type:String,required:true},
    createdBy:{type:Schema.ObjectId,required:true}
}, { collection : 'deposits'});


var Deposits= mongoose.model('deposits', DepositSchema);

DepositSchema.plugin(abstract);

DepositSchema.plugin(autoIncrement.plugin,{model:Deposits,field:'depositUid',startAt: 1, incrementBy: 1});

module.exports = Deposits;