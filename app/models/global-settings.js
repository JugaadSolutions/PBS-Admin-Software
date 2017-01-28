/**
 * Created by root on 16/1/17.
 */
//require('./index');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Constants = require('../core/constants');

var GlobalSettingSchema = mongoose.Schema({
    globalId:Number,
    name: {type: String, required: true, unique: true},
    value: {type: [String], required: true},
    visibility:{type:Number,required:false,default:1}
}, { collection : 'global-settings' });


var Gs = mongoose.model('global-setting', GlobalSettingSchema);

GlobalSettingSchema.plugin(abstract);

GlobalSettingSchema.plugin(autoIncrement.plugin,{model:Gs,field:'globalId',startAt: 1, incrementBy: 1});


module.exports = Gs;