require('./index');
var mongoose = require('mongoose');
    //bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var abstract = require('./abstract');
    //Constants = require('../core/constants'),
    //Messages = require('../core/messages'),
    //ValidationHandler = require('../handlers/validation-handler');
var autoIncrement = require('mongoose-auto-increment');


var PortSchema = mongoose.Schema({
    PortID : Number,
    vehicleId:{type:Schema.ObjectId, required:false},
    Name:{type:String,required:false}

}, { collection : 'ports', discriminatorKey : '_type' });


var Port = mongoose.model('port', PortSchema);

PortSchema.plugin(abstract);

PortSchema.plugin(autoIncrement.plugin,{model:Port,field:'PortID',startAt: 1, incrementBy: 1});


module.exports = Port;