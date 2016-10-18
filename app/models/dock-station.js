require('./station');
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
    //Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var DockStationSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    ipAddress:{type:String,required:false,unique:true}
    //noOfPorts:{type:Number,required:false}

});

var DockStation = mongoose.model('dock-station', DockStationSchema);


module.exports=DockStation;