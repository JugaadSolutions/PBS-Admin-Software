// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var //DockingUnitService = require('../services/docking-unit-service'),

    //RequestHandler = require('../handlers/request-handler'),
    HoldingPort = require('../models/holding-port'),
    Holdingarea = require('../models/holding-area'),
    Station = require('../models/station'),
    Messages = require('../core/messages');

// Method to create Docking Port
/* ***************************** With Inheritence ************************ */

exports.createPort=function (record,callback) {
    var holdingareaDetails;
    async.series([
        function (callback) {
            if(isNaN(record.StationId))
            {
                return callback(null,null);
            }
            else
            {
                Station.findOne({StationID:record.StationId},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error('No station found for the given id'),null);
                    }
                    record.StationId = result._id;
                    return callback(null,result);
                });
            }
        },
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
                Holdingarea.findById(holdingareaDetails.StationId,function (err,result) {
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
    if(isNaN(id))
    {
        HoldingPort.findById(id,function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        HoldingPort.findOne({PortID:id},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
};

exports.updateHoldingport = function (id,record,callback) {
    if(isNaN(id))
    {
        HoldingPort.findByIdAndUpdate(id,record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        HoldingPort.findOneAndUpdate({PortID:id},record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
};