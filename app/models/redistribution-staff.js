/**
 * Created by root on 25/12/16.
 */
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;



var RedistributionStaffSchema = require('mongoose').model('user').schema.extend({
    employeeId:{type:String,required:false},
    position:{type:String,required:false},
    experiance:{type:Number,required:false},
    joiningDate:{type:Date,required:false},
    additionalInfo:{type:String,required:false},
    status:{type:Number,required:false,default:0}
});

var RedistributionEmployee = mongoose.model('redistribution-employee', RedistributionStaffSchema);


module.exports=RedistributionEmployee;

