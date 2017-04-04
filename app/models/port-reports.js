/**
 * Created by root on 3/4/17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Messages = require('../core/messages');

var PortInfoSchema = mongoose.Schema({
    portinfoUid:Number,
    portId:{type:Schema.ObjectId,required:false,ref:'port'},
    dateTime:{type:Date,required: false,default:Date.now},
    comments:{type:String,required:false},
    createdTime:{type:Date,required:false,default:Date.now},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'}
}, { collection : 'portinfo' });

var PortInfo = mongoose.model('portinfo', PortInfoSchema);
PortInfoSchema.plugin(abstract);
PortInfoSchema.plugin(autoIncrement.plugin,{model:PortInfo,field:'portinfoUid',startAt: 1, incrementBy: 1});
module.exports = PortInfo;