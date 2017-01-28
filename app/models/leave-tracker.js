/**
 * Created by root on 7/1/17.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    Constants = require('../core/constants');

const shift = Constants.EmployeeShift;

var LeaveTrackerSchema = mongoose.Schema({
    empid: {type: Schema.ObjectId, required: false, ref: 'user'},
    shifts:{type:shift,required:false},
    department:{type:String,required:false},
    fromdate:{type:Date,required:true,default:Date.now},
    todate:{type:Date,required:false,default:Date.now},
    reason:{type:String,required:false},
    createdBy: {type: Schema.ObjectId, required: false, ref: 'user'},
    createdDate:{type:Date,required:true,default:Date.now}
}, { collection : 'leavetracks' });


var LeaveTracker = mongoose.model('leavetracker', LeaveTrackerSchema);

LeaveTrackerSchema.plugin(abstract);

module.exports = LeaveTracker;
