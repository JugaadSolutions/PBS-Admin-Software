/**
 * Created by root on 17/1/17.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    Constants = require('../core/constants');

var autoIncrement = require('mongoose-auto-increment');


var KioskTransactionSchema = mongoose.Schema({
    transId:Number,
    createdOn:{type:Date,required:false,default:Date.now},
    dateTime:{type:Date,required:false,default:Date.now},
    cardRFID: {type: String, required: true},
    user:{type:Schema.ObjectId,required:false,ref:'user'},
    status:{type:Number,required:false,default:0},
    result:{type:String,required:false},
    duration:{type:Number,required:false,default:0},
    transactionInitiatedTime: {type: Date, required: false},
    transactionCompletionTime: {type: Date, required: false}
}, { collection : 'kiosk-transactions' });


var KioskTransaction = mongoose.model('kiosk-transaction', KioskTransactionSchema);

KioskTransactionSchema.plugin(abstract);

KioskTransactionSchema.plugin(autoIncrement.plugin,{model:KioskTransaction,field:'transId',startAt: 1, incrementBy: 1});


module.exports = KioskTransaction;
