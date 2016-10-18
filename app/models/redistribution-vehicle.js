var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var RedistributionVehicleSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true}
});

var RedistributionVehicle = mongoose.model('redistribution-vehicle', RedistributionVehicleSchema);


module.exports=RedistributionVehicle;