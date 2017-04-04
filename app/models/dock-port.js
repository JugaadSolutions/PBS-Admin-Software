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
    DockingStationName:{type:String,required:false}
});

var DockPort = mongoose.model('Docking-port', DockPortSchema);


module.exports=DockPort;