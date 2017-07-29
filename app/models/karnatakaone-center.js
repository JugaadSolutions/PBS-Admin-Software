/**
 * Created by root on 30/6/17.
 */
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const GPS = {
    longitude: {type: Number, required: false},
    latitude: {type: Number, required: false}
};

var KarnatakaOneCenterSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    location:{type:String,required:false},
    assignedTo:{type:Schema.ObjectId,required:false,ref:'user'},
    gpsCoordinates: {type: GPS, required: false}
});

var KarnatakaOneCenter = mongoose.model('kone-center', KarnatakaOneCenterSchema);


module.exports=KarnatakaOneCenter;