var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const GPS = {
    longitude: {type: Number, required: false},
    latitude: {type: Number, required: false}
};

const Zone = Constants.Zones;

var RedistributionPortSchema = require('mongoose').model('port').schema.extend({
    StationId:{type:Schema.ObjectId, required:false, ref:'station'},
    assignedTo:{type:Schema.ObjectId,required:false,ref:'user'},
    vehiclePlate: {type: String, required: true, unique: true},
    zoneId:{type:Zone,required:false},
    driverId: {type: String, required: false},
    gpsCoordinates: {type: GPS, required: false},
    assignedBy:{type:Schema.ObjectId,required:false,ref:'user'}
});

var RedistributionPort = mongoose.model('Redistribution-vehicle', RedistributionPortSchema);


module.exports=RedistributionPort;