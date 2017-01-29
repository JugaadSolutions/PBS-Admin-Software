var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Messages = require('../core/messages'),
    config = require('config'),
    Schema = mongoose.Schema;

//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;
const Fleetports ={
    dockingPortId: {type: Schema.ObjectId, required: true, ref: 'port'}
};

var FleetAreaSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    portIds:{type:[Fleetports],required:false,default:[]}

});

var FleetArea = mongoose.model('fleet-area', FleetAreaSchema);

FleetArea.count({stationType: "fleet-area"}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_FLEET_COLLECTION + err);
    }
    if (count < 1) {
        var defaults = {
            name:config.get('PBS-Identifier')+'-Fleet'
        };
        FleetArea.create(defaults, function (err) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_THE_FLEET_COLLECTION+ err);
            }
        });
    }
});

module.exports=FleetArea;