/**
 * Created by root on 2/12/16.
 */
// Third Party Dependencies
var mongoose = require('mongoose');

// Application Level Dependencies
var abstract = require('./abstract');

// Mongoose Schema
var Schema = mongoose.Schema;
var schema = {

    user: {type: String, required: false},
    vehicleId: {type: String, required: false},
    fromPort: {type: String, required: false},// ref: 'DockingPort'},
    checkOutTime: {type: String, required: false},
    status: {type: String, required: false,default:'Open'},
    errorStatus:{type: String, required: false},
    errorMsg:{type: String, required: false},
    checkOutInitiatedTime: {type: String, required: false},
    checkOutCompletionTime: {type: String, required: false}
};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var CheckOutError = mongoose.model('CheckOutError', model, 'checkoutError');


module.exports = CheckOutError;
