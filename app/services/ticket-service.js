/**
 * Created by root on 24/12/16.
 */
var Ticket = require('../models/tickets');


exports.createTicket = function (record,callback) {

    Ticket.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};