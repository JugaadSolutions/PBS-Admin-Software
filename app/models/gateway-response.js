/**
 * Created by root on 2/2/17.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Messages = require('../core/messages'),
    moment = require('moment'),
    Constants = require('../core/constants');

var CcavenueResponseSchema = mongoose.Schema({
    gatewayId:Number,
    order_status:{type: String, required: false},
    comments:{type: String, required: false},
    credit:{type: String, required: false},
    creditMode:{type: String, required: false},
    transactionNumber:{type: String, required: false},
    paymentdate:{type: Date, required: false},
    userId:{type: String, required: false},
    order_id:{type: String, required: false},
    bank_ref_no:{type: String, required: false},
    failure_msg:{type: String, required: false},
    card_name:{type: String, required: false},
    status_code:{type: String, required: false},
    status_msg:{type: String, required: false},
    membershiptypeid:{type: String, required: false},
    paymentfor:{type: String, required: false},
    customer_notes:{type: String, required: false}
}, { collection : 'ccavenue-response' });

var Gateway = mongoose.model('ccavenue-response', CcavenueResponseSchema);

CcavenueResponseSchema.plugin(abstract);

CcavenueResponseSchema.plugin(autoIncrement.plugin,{model:Gateway,field:'gatewayId',startAt: 1, incrementBy: 1});

module.exports = Gateway;