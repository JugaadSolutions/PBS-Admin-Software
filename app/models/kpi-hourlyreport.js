/**
 * Created by root on 15/1/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var abstract = require('./abstract');

var KpiHourlyReportSchema = mongoose.Schema({

    reportId:Number,
    dateAndTime:{type:Date,required: true,default:Date.now},
    cyclesInPort:{type:Number,required:false,default:0},
    cyclesWithUsers:{type:Number,required:false,default:0},
    cyclesWithMembers:{type:Number,required:false,default:0},
    cyclesWithEmployees:{type:Number,required:false,default:0},
    cyclesWithRv:{type:Number,required:false,default:0},
    cyclesWithMa:{type:Number,required:false,default:0},
    cyclesWithHa:{type:Number,required:false,default:0},
    nonWorkingPort:{type:Number,required:false,default:0},
    emptyPort:{type:Number,required:false,default:0},
    requiredFleetSize:{type:Number,required:false}


}, { collection : 'kpi-hourlyreport' });


var KpiHourly = mongoose.model('kpi-hourly', KpiHourlyReportSchema);

KpiHourlyReportSchema.plugin(abstract);

KpiHourlyReportSchema.plugin(autoIncrement.plugin,{model:KpiHourly,field:'reportId',startAt: 1, incrementBy: 1});


module.exports = KpiHourly;
