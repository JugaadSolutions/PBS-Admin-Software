/**
 * Created by root on 5/3/17.
 */
var mongoose = require('mongoose'),
    //extend = require('mongoose-schema-extend'),
    Messages = require('../core/messages'),
    config = require('config'),
    Schema = mongoose.Schema;

var ControlCentreSchema = require('mongoose').model('station').schema.extend({
    name:{type:String,required:false,unique:true}
});

var ControlCentre = mongoose.model('Control-centre', ControlCentreSchema);

ControlCentre.count({stationType: "Control-centre"}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_CONTROL_CENTRE_COLLECTION + err);
    }
    if (count < 1) {
        var defaults = {
            name:config.get('PBS-Identifier')+'-Control-Centre'
        };
        ControlCentre.create(defaults, function (err) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_THE_CONTROL_CENTRE_COLLECTION + err);
            }
        });
    }
});

module.exports=ControlCentre;