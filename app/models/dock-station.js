//require('./station');
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema,
    Constants = require('../core/constants');

const stationStats = Constants.AvailabilityStatus;

const DockingPorts ={
    dockingPortId: {type: Schema.ObjectId, required: true, ref: 'port'}
};

const Type = Constants.StationType;
const Temp = Constants.StationTemplate;
const Zone = Constants.Zones;
/*
const GPS = {
    longitude: {type: Number, required: false},
    latitude: {type: Number, required: false}
};
*/

var DockStationSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    ipAddress:{type:String,required:false,unique:true},
    subnet:{type:Number,required:false,unique:true},
    stationStatus:{type:stationStats,required:false,default:stationStats.EMPTY},
//  gpsCoordinates: {type: GPS, required: false},
    modelType:{type:Type,required:false,default:Type.MINOR},
    template:{type:Temp,required:false,default:Temp.T1},
    minAlert:{type:Number,required:true},
    maxAlert:{type:Number,required:true},
    zoneId:{type:Zone,required:true},
    stationNumber:{type:String,required:false},
    noofUnits:{type:Number,required:false},
    noofPorts:{type:Number,required:false},
    portIds:{type:[DockingPorts],required:false},
    commissioneddate:{type:Date,required:false}
    //noOfPorts:{type:Number,required:false}

});

var DockStation = mongoose.model('dock-station', DockStationSchema);


module.exports=DockStation;