var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Constants = require('../core/constants');

var role = {
    role:{type:String,required:false}
};

var FeatureSchema = mongoose.Schema({
    featureUid:Number,
    Name:{type:String,required:false},
    parent:{type:Schema.ObjectId,required:false},
    roles:{type:[role],required:false,default:[]}
}, { collection : 'features'});


var Features = mongoose.model('features', FeatureSchema);

FeatureSchema.plugin(abstract);

FeatureSchema.plugin(autoIncrement.plugin,{model:Features,field:'featureUid',startAt: 1, incrementBy: 1});

module.exports = Features;
