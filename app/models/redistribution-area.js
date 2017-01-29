var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Messages = require('../core/messages'),
    config = require('config'),
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

var RedistributionVehicle = mongoose.model('Redistribution-area', RedistributionVehicleSchema);

RedistributionVehicle.count({stationType: "Redistribution-area"}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_REDISTRIBUTION_AREA_COLLECTION + err);
    }
    if (count < 1) {
        var defaults = {
            name:config.get('PBS-Identifier')+'-Redistribution'
        };
        RedistributionVehicle.create(defaults, function (err) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_THE_REDISTRIBUTION_AREA_COLLECTION + err);
            }
        });
    }
});

module.exports=RedistributionVehicle;