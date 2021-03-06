/**
 * Created by root on 13/12/16.
 */
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const empstat = Constants.EmployeeStatus;

var MaintenanceCentreStaffSchema = require('mongoose').model('user').schema.extend({
    employeeId:{type:String,required:false},
    position:{type:String,required:false},
    experiance:{type:Number,required:false},
    joiningDate:{type:Date,required:false},
    additionalInfo:{type:String,required:false},
    status:{type:empstat,required:false,default:empstat.INACTIVE}
});

var MaintenanceCentreEmployee = mongoose.model('maintenancecentre-employee', MaintenanceCentreStaffSchema);


module.exports=MaintenanceCentreEmployee;
