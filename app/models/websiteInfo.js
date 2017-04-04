/**
 * Created by root on 31/3/17.
 */

var mongoose = require('mongoose'),
     Schema = mongoose.Schema,
    abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Messages = require('../core/messages');


var WebinfoSchema = mongoose.Schema({
    webinfoUid:Number,
    dateTime:{type:Date,required: false},
    duration:{type:Number,required:false},
    reason:{type:String,required:false},
    comments:{type:String,required:false},
    createdTime:{type:Date,required:false,default:Date.now},
    createdBy:{type:Schema.ObjectId,required:false}
}, { collection : 'websiteinfo' });

var WebInfo = mongoose.model('websiteinfo', WebinfoSchema);

WebinfoSchema.plugin(abstract);

WebinfoSchema.plugin(autoIncrement.plugin,{model:WebInfo,field:'webinfoUid',startAt: 1, incrementBy: 1});


module.exports = WebInfo;