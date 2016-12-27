/**
 * Created by root on 27/12/16.
 */
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var AccountsAdminSchema = require('mongoose').model('user').schema.extend({
    employeeId:{type:String,required:false},
    position:{type:String,required:false},
    experiance:{type:Number,required:false},
    joiningDate:{type:Date,required:false},
    additionalInfo:{type:String,required:false},
    status:{type:Number,required:false,default:0}
});

var AccountsAdmin= mongoose.model('Accounts-admin', AccountsAdminSchema);


module.exports=AccountsAdmin;
