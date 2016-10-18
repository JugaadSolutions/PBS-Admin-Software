// Third Party Dependencies
var mongoose = require('mongoose');
//var db = mongoose.connect('mongodb://127.0.0.1:27017/test');
var uuid = require('node-uuid'),
    _ = require('underscore');

// Application Level Dependencies
var abstract = require('./abstract');
//Constants = require('../core/constants');

//var checkoutstatus = Constants.CheckOutInStatus;

// Mongoose Schema
var Schema = mongoose.Schema;
var schema = {

    user: {type: Schema.ObjectId, required: false, ref: 'User'},
    vehicle: {type: Schema.ObjectId, required: true, ref: 'Vehicle'},
    fromPort: {type: Schema.ObjectId, required: true, ref: 'Dockport'},
    toPort: {type: Schema.ObjectId, required: true,ref: 'Dockport'},
    checkOutTime: {type: Date, required: false},
    checkInTime: {type: Date, required: false},
    duration: {type: Number, required: false},
    creditsUsed: {type: Number, required: false, default: 0},
    creditBalance: {type: Number, required: false},
    status: {type: String, required: true,default:'Close'}

};

var model = new Schema(schema);

// Plugins
model.plugin(abstract);

// Mongoose Model
var Transaction = mongoose.model('Transaction', model, 'transaction');
/*var check = new CheckOut({
 member:'asdf',
 bicycle:'qwer',
 fromPort:'tyui',
 status:'trt',
 errormsg:'lkjk'
 });
 check.save(function (error) {
 console.log("Your check has been saved!");
 if (error) {
 console.error(error);
 }
 });*/

module.exports = Transaction;

