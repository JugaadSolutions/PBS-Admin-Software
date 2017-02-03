/**
 * Created by root on 24/12/16.
 */
var Constants = require('../core/constants'),
    moment = require('moment'),
    async = require('async'),
    User = require('../models/user'),
    Ticket = require('../models/tickets');


exports.createTicket = function (record,callback) {
    var ticketInfo;
async.series([
    function (callback) {
        User.findOne({UserID:record.createdBy},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            record.createdBy = result._id;
            return callback(null,result);
        });
    },
    function (callback) {
        Ticket.create(record,function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            ticketInfo = result;
            return callback(null,result);
        });
    }
],function (err,result) {
    if(err)
    {
        return callback(err,null);
    }
    return callback(null,ticketInfo);
});

};

exports.ticketUpdate=function (id,record,callback) {
    if(record.status == Constants.TicketStatus.CLOSED)
    {
        var Close = new Date();
        var Open = moment(record.ticketdate);

        var durationMin = moment.duration(moment(Close).diff(Open));
        var duration = durationMin.asMinutes();
        record.closedDuration = duration;
    }
    Ticket.findByIdAndUpdate(id,record,{new:true},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.addReply = function (id,record,callback) {
        var ticket;
        async.series([
            function (callback) {
                Ticket.findOne({_id:id},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    ticket=result;
                    return callback(null,result);
                });
            },
            function (callback) {
                if(ticket)
                {
                    if(record.status==Constants.TicketStatus.CLOSED)
                    {
                        var Close = new Date();
                        var Open = moment(ticket.ticketdate);

                        var durationMin = moment.duration(moment(Close).diff(Open));
                        var duration = durationMin.asMinutes();
                        ticket.closedDuration = duration;
                    }
                    ticket.status=record.status;
                    ticket.transactions.push(record);
                    Ticket.findByIdAndUpdate(id,ticket,{new:true},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        ticket = result;
                        return callback(null,result);
                    });
                }
                else
                {
                    return callback(null,null);
                }
            }
        ],function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,ticket);
        });
};