/**
 * Created by root on 21/12/16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract');
var Constants = require('../core/constants');

const trans = {
    userid:{type:Schema.ObjectId,required:false,ref:'user'},
    assignedEmp:{type:Schema.ObjectId,required:false,ref:'user'},
    description:{type:String,required:false}
};

const comType = Constants.ComplaintValidation;

var TicketsSchema = mongoose.Schema({
    user:{type:Schema.ObjectId,required:false,ref:'user'},
    tickettype:{type:Number,required:false},
    department:{type:String,required:false},
    subject:{type:String,required:false},
    description:{type:String,required:false},
    complaintType:{type:comType,required:true,default:comType.INVALID},
    assignedEmp:{type:Schema.ObjectId,required:false,ref:'user'},
    status:{type:String,required:false},
    priority:{type:Number,required:false},
    ticketdate:{type:Date,required:true,default:Date.now},
    transactions:{type:[trans],required:false},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'}
}, { collection : 'tickets'});


var Tickets = mongoose.model('tickets', TicketsSchema);

TicketsSchema.plugin(abstract);

module.exports = Tickets;