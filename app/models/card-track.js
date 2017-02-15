/**
 * Created by root on 13/2/17.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Constants = require('../core/constants');

const CardStatus = Constants.CardStatus;

var CardTrackSchema = mongoose.Schema({
    cardTrackUid:Number,
    dateTime:{type:Date,required:false,default:Date.now},
    assignerUserId:{type:Schema.ObjectId,required:false},
    preStatus:{type: CardStatus, required: false},
    postStatus:{type: CardStatus, required: false},
    cardId:{type:Schema.ObjectId,required:false},
    changerId: {type: Schema.ObjectId, required: false, ref: 'user'}
}, { collection : 'card-tracker' });

var CardTracker = mongoose.model('card-tracker', CardTrackSchema);
CardTrackSchema.plugin(abstract);
CardTrackSchema.plugin(autoIncrement.plugin,{model:CardTracker,field:'cardTrackUid',startAt: 1, incrementBy: 1});

module.exports = CardTracker;
