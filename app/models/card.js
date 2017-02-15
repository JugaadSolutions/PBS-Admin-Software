//require('./index');
var mongoose = require('mongoose');
//bcrypt = require('bcryptjs');
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
Constants = require('../core/constants');
//Messages = require('../core/messages'),
//ValidationHandler = require('../handlers/validation-handler');
//var autoIncrement = require('mongoose-auto-increment');
const CardStatus = Constants.CardStatus;
const CardType = Constants.CardType;

var CardSchema = mongoose.Schema({
    cardUid:Number,
    cardNumber: {type: Number, required: true, unique: true},
    cardRFID: {type: String, required: true, unique: true},
    assignedTo: {type: Schema.ObjectId, required: false, ref: 'user'},
    issuedBy: {type: Schema.ObjectId, required: false, ref: 'user'},
    balance: {type: Number, required: false, default: 0},
    membershipId: {type: Schema.ObjectId, required: false, ref: 'Membership'},
    status: {type: CardStatus, required: true, default: CardStatus.AVAILABLE},
    cardType: {type: CardType, required: true,default: CardType.REGISTERED_MEMBER},
    issuedDate:{type:Date,required: false}

}, { collection : 'cards' });


var Card = mongoose.model('card', CardSchema);

CardSchema.plugin(abstract);

CardSchema.plugin(autoIncrement.plugin,{model:Card,field:'cardUid',startAt: 1, incrementBy: 1});


module.exports = Card;