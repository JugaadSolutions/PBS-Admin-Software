//require('./index');
var mongoose = require('mongoose');
//bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var abstract = require('./abstract');
//Constants = require('../core/constants'),
//Messages = require('../core/messages'),
//ValidationHandler = require('../handlers/validation-handler');
//var autoIncrement = require('mongoose-auto-increment');


var CardSchema = mongoose.Schema({
    cardNumber: {type: String, required: true, unique: true},
    cardRFID: {type: String, required: true, unique: true},
    assignedTo: {type: Schema.ObjectId, required: false, ref: 'user'},
    balance: {type: Number, required: false, default: 0},
    membershipId: {type: Schema.ObjectId, required: false, ref: 'Membership'},


}, { collection : 'cards' });


var Card = mongoose.model('card', CardSchema);

CardSchema.plugin(abstract);

//StationSchema.plugin(autoIncrement.plugin,{model:Station,field:'StationID',startAt: 1, incrementBy: 1});


module.exports = Card;