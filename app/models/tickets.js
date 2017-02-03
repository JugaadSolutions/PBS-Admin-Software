/**
 * Created by root on 21/12/16.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract');
var random = require("node-random");
var autoIncrement = require('mongoose-auto-increment');
var Constants = require('../core/constants');

const comType = Constants.ComplaintValidation;

const stats = Constants.TicketStatus;

const trans = {
    //userid:{type:Schema.ObjectId,required:false,ref:'user'},
    replierId:{type:Schema.ObjectId,required:false,ref:'user'},
    description:{type:String,required:false},
    status:{type:stats,required:true,default:stats.OPEN},
    replydate:{type:Date,required:true,default:Date.now}
};

const channel = Constants.TicketChannel;

var TicketsSchema = mongoose.Schema({
    user:{type:Schema.ObjectId,required:false,ref:'user'},
    name:{type:String,required:false},
    uuId:{type:Number,required:false},
    channel:{type:channel,required:false},
    tickettype:{type:String,required:false},
    department:{type:String,required:false},
    subject:{type:String,required:false},
    description:{type:String,required:false},
    complaintType:{type:comType,required:true,default:comType.INVALID},
    assignedEmp:{type:Schema.ObjectId,required:false,ref:'user'},
    status:{type:stats,required:true,default:stats.OPEN},
    priority:{type:Number,required:false},
    closedDuration:{type:Number,required:false},
    ticketdate:{type:Date,required:true,default:Date.now},
    transactions:{type:[trans],required:false},
    duration:{type:Number,required:false,default:0},
    createdBy:{type:Schema.ObjectId,required:false,ref:'user'}
}, { collection : 'tickets'});


var Tickets = mongoose.model('tickets', TicketsSchema);

TicketsSchema.plugin(abstract);

TicketsSchema.plugin(autoIncrement.plugin,{model:Tickets,field:'uuId',startAt: 1, incrementBy: 1});

module.exports = Tickets;