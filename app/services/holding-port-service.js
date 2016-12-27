// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var //DockingUnitService = require('../services/docking-unit-service'),

    //RequestHandler = require('../handlers/request-handler'),
    HoldingPort = require('../models/holding-port'),
    Holdingarea = require('../models/holding-area'),
    Messages = require('../core/messages');

// Method to create Docking Port
/* ***************************** With Inheritence ************************ */

exports.createPort=function (record,callback) {
    var holdingareaDetails;
    async.series([
        function (callback) {
            HoldingPort.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                holdingareaDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(holdingareaDetails)
            {
                Holdingarea.findOne({'_id':holdingareaDetails.StationId},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    var portDetails = {
                        dockingPortId:holdingareaDetails._id
                    };
                    result.portIds.push(portDetails);
                    Holdingarea.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });
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
        return callback(null,holdingareaDetails);
    });

};

exports.getAllRecords=function (record,callback) {
    HoldingPort.find({'_type':'Holding-area'},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getOneRecord = function (id,callback) {
    HoldingPort.findOne({'_id':id},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateHoldingport = function (id,record,callback) {
    HoldingPort.findByIdAndUpdate(id,record,{new:true},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};