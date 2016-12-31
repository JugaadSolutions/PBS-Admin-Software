var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const GPS = {
    longitude: {type: Number, required: false},
    latitude: {type: Number, required: false}
};

var MaintenancePortSchema = require('mongoose').model('port').schema.extend({
    StationId:{type:Schema.ObjectId, required:false, ref:'station'},
    assignedTo:{type:Schema.ObjectId,required:false,ref:'user'},
    assignedBy:{type:Schema.ObjectId,required:false,ref:'user'},
    gpsCoordinates: {type: GPS, required: false}
});
var MaintenancePort = mongoose.model('Maintenance-area', MaintenancePortSchema);


module.exports=MaintenancePort;