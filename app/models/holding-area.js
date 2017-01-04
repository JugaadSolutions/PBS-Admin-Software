var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const Holdingports ={
    dockingPortId: {type: Schema.ObjectId, required: true, ref: 'port'}
};

var HoldingAreaSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    portIds:{type:[Holdingports],required:false}

});

var HoldingStation = mongoose.model('Holding-station', HoldingAreaSchema);


module.exports=HoldingStation;