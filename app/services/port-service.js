/**
 * Created by root on 3/4/17.
 */

var async = require('async'),
    moment = require('moment'),
    User = require('../models/user'),
    Ports = require('../models/port'),
    PortReport = require('../models/port-reports');

exports.createPortReport = function (record,callback) {

    var portDetails;
    var portReport;
    async.series([
        function (callback) {
            if(record.createdBy)
            {
                User.findOne({UserID:record.createdBy},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error('Logged in user Id not found'));
                    }
                    record.createdBy = result._id;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(record.portId)
            {
                if(isNaN(record.portId))
                {
                    return callback(new Error('Error in Port Id'),null);
                }
                else
                {
                    Ports.findOne({PortID:record.portId},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error('Port not found for the given id'),null);
                        }
                        portDetails = result;
                        record.portId = result._id;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(new Error("Couldn't find port id from the view"),null);
            }

        },
        function (callback) {
            if(portDetails)
            {
                PortReport.create(record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    portReport = result;
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
        return callback(null,portReport);
    })
};