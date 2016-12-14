/**
 * Created by root on 11/12/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var abstract = require('./abstract');

var PoolingAccountSchema = mongoose.Schema({
    memberId:{type:Schema.ObjectId,required:true,ref:'user'},
    timestamp:{type:Date,required: false, default:Date.now()},
    amount:{type:Number,required: false,default:0}
}, { collection : 'pooling-account'});


var PoolingTransaction = mongoose.model('pooling-account', PoolingAccountSchema);

PoolingAccountSchema.plugin(abstract);

module.exports = PoolingTransaction;