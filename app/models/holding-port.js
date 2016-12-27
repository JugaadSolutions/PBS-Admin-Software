require('./port');
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;


var HoldingPortSchema = require('mongoose').model('port').schema.extend({
    StationId:{type:Schema.ObjectId, required:false, ref:'station'},
    assignedTo:{type:Schema.ObjectId,required:false,ref:'user'},
    assignedBy:{type:Schema.ObjectId,required:false,ref:'user'}
});

var HoldingPort = mongoose.model('Holding-area', HoldingPortSchema);


module.exports=HoldingPort;