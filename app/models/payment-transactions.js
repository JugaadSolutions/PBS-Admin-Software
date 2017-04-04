
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    Constants = require('../core/constants');

const Description =  Constants.PayDescription;
const Mode = Constants.PayMode;
const PayThrough=Constants.PayThrough;
const Loc=Constants.Loc;

var PaymentTransactionSchema = mongoose.Schema({
    memberId:{type:Schema.ObjectId,required:true,ref:'user'},
    invoiceNo : {type:String,required:true},
    paymentDescription:{type:Description,required:true},
    paymentMode:{type:Mode,required:false},
    paymentThrough:{type:PayThrough,required:false},
    gatewayTransactionId:{type:String,required:false},
    comments:{type:String,required:false},
    location:{type:String,required:true,default:Loc.REG_CENTRE},
    debit:{type:Number,required:false,default:0},
    credit:{type:Number,required:false,default:0},
    balance:{type:Number,required:true},
    createdAt:{type:Date,required: false, default:Date.now()},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'}
}, { collection : 'payment-transactions'});


var PaymentTransaction = mongoose.model('payment-transaction', PaymentTransactionSchema);

PaymentTransactionSchema.plugin(abstract);

module.exports = PaymentTransaction;