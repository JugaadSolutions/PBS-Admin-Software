var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const RVvehicles ={
    dockingPortId: {type: Schema.ObjectId, required: true, ref: 'port'}
};

var RedistributionVehicleSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    portIds:{type:[RVvehicles],required:false}
    /*vehiclePlate: {type: String, required: true, unique: true},
    driverId: {type: String, required: false}*/
});

var RedistributionVehicle = mongoose.model('redistribution-area', RedistributionVehicleSchema);


module.exports=RedistributionVehicle;