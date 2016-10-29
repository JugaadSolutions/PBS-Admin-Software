var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
    //Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var RegistrationStaffSchema = require('mongoose').model('user').schema.extend({
    employeeId:{type:String,required:false,unique:true},
    position:{type:String,required:false},
    experiance:{type:Number,required:false},
    joiningDate:{type:Date,required:false},
    additionalInfo:{type:String,required:false}
});

var RegistrationEmployee = mongoose.model('registration-employee', RegistrationStaffSchema);


module.exports=RegistrationEmployee;