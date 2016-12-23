/**
 * Created by root on 19/12/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    Constants = require('../core/constants');

var autoIncrement = require('mongoose-auto-increment');

const status = Constants.AvailabilityStatus;
const stattype = Constants.StationType;

var KpiStationSchema = mongoose.Schema({
    RecordID : Number,
    stationid:{type: Schema.ObjectId, required: false, ref: 'station'},
    status:{type:status,required:false,default:Constants.AvailabilityStatus.EMPTY},
    starttime:{type:Date,required:false},
    endtime:{type:Date,required:false},
    timeduration:{type:Number,required:false,default:0},
    peekduration:{type:Number,required:false,default:0},
    offpeekduration:{type:Number,required:false,default:0},
    stationtype:{type:stattype,required:false,default:stattype.MINOR},
    cyclenums:{type:Number,required:false},
    updateStatus:{type: Number, required: false,default:0},
    updatedcyclenums:{type:Number,required:false}
}, { collection : 'kpidockstations'});


var Kpidockstation = mongoose.model('kpidockstation', KpiStationSchema);

KpiStationSchema.plugin(abstract);

KpiStationSchema.plugin(autoIncrement.plugin,{model:Kpidockstation,field:'RecordID',startAt: 1, incrementBy: 1});


module.exports = Kpidockstation;
