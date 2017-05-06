/**
 * Created by root on 6/5/17.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract');


const Document = {
    documentCopy: {type: String, required: false}
};

var StationNotCleanSchema = mongoose.Schema({
    stationId : {type:Schema.ObjectId,required:true,ref:'station'},
    notcleaneddate:{type:Date,required:true},
    reportedBy:{type:String,required:false},
    remarks:{type:String,required:false},
    documents:{type:[Document],required:false},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'}
}, { collection : 'stationsclean'});


var StationClean = mongoose.model('stationnotclean', StationNotCleanSchema);

StationNotCleanSchema.plugin(abstract);

module.exports = StationClean;