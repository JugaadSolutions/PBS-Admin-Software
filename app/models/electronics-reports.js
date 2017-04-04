/**
 * Created by root on 3/4/17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Messages = require('../core/messages');

var ElectronicsInfoSchema = mongoose.Schema({
    electronicsinfoUid:Number,
    stationId:{type:Schema.ObjectId,required:false,ref:'station'},
    dateTime:{type:Date,required: false,default:Date.now},
    meterReading:{type:String,required:false},
    batteryVoltage:{type:String,required:false},
    cctvStatus:{type:String,required:false},
    cpuStatus:{type:String,required:false},
    kioskdisplayStatus:{type:String,required:false},
    createdTime:{type:Date,required:false,default:Date.now},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'}
}, { collection : 'electronicsinfo' });

var ElectronicsInfo = mongoose.model('electronicsinfo', ElectronicsInfoSchema);
ElectronicsInfoSchema.plugin(abstract);
ElectronicsInfoSchema.plugin(autoIncrement.plugin,{model:ElectronicsInfo,field:'electronicsinfoUid',startAt: 1, incrementBy: 1});
module.exports = ElectronicsInfo;