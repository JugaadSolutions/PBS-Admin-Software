var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Messages = require('../core/messages'),
    config = require('config'),
    Schema = mongoose.Schema;
//Constants = require('../core/constants');

//const MemberStatus = Constants.MemberStatus;

const MCports ={
    dockingPortId: {type: Schema.ObjectId, required: true, ref: 'port'}
};

var MaintenanceCenterSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true},
    portIds:{type:[MCports],required:false,default:[]}

});

var MaintenanceCenter = mongoose.model('maintenance-center', MaintenanceCenterSchema);

MaintenanceCenter.count({stationType: "maintenance-center"}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_MAINTENANCE_CENTER_COLLECTION + err);
    }
    if (count < 1) {
        var defaults = {
            name:config.get('PBS-Identifier')+'-Maintenance Centers'
        };
        MaintenanceCenter.create(defaults, function (err) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_THE_MAINTENANCE_CENTER_COLLECTION + err);
            }
        });
    }
});

module.exports=MaintenanceCenter;