/**
 * Created by root on 23/12/16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract');


var StationCleanSchema = mongoose.Schema({
    stationId : {type:Schema.ObjectId,required:true,ref:'station'},
    cleaneddate:{type:Date,required:true},
    fromtime:{type:Date,required:true},
    totime:{type:Date,required:true},
    empId:{type:Schema.ObjectId,required:true,ref:'user'},
    description:{type:String,required:false},
    cleanCount:{type:Number,required:false,default:1},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'}
}, { collection : 'stationsclean'});


var StationClean = mongoose.model('stationclean', StationCleanSchema);

StationCleanSchema.plugin(abstract);

module.exports = StationClean;
