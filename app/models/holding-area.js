var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Messages = require('../core/messages'),
    config = require('config'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const Holdingports ={
    dockingPortId: {type: Schema.ObjectId, required: true, ref: 'port'}
};

var HoldingAreaSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    portIds:{type:[Holdingports],required:false,default:[]}
});

var HoldingStation = mongoose.model('Holding-station', HoldingAreaSchema);

HoldingStation.count({stationType: "Holding-station"}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_HOLDING_AREA_COLLECTION + err);
    }
    if (count < 1) {
        var defaults = {
            name:config.get('PBS-Identifier')+'-Holding Station'
        };
        HoldingStation.create(defaults, function (err) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_THE_HOLDING_AREA_COLLECTION + err);
            }
        });
    }
});

module.exports=HoldingStation;