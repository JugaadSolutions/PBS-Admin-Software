require('./port');
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
    //Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var DockPortSchema = require('mongoose').model('port').schema.extend({
    StationId:{type:Schema.ObjectId, required:false, ref:'dock-station'},
    FPGA:{type:Number,required:false},
    ePortNumber:{type:Number,required:false},
    DockingStationName:{type:String,required:false},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
});

var DockPort = mongoose.model('Docking-port', DockPortSchema);


module.exports=DockPort;