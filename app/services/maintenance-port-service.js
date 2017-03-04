// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var
    MaintenancePort = require('../models/maintenance-port'),
    MaintenanceArea = require('../models/maintenance-center'),
    Messages = require('../core/messages');

exports.createPort=function (record,callback) {
    var MaintenanceDetails;
    async.series([
        function (callback) {
            MaintenancePort.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                MaintenanceDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(MaintenanceDetails)
            {
                MaintenanceArea.findOne({'_id':MaintenanceDetails.StationId},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    var portDetails = {
                        dockingPortId:MaintenanceDetails._id
                    };
                    result.portIds.push(portDetails);
                    MaintenanceArea.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
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
        return callback(null,MaintenanceDetails);
    });

};

exports.getAllRecords=function (record,callback) {
    MaintenancePort.find({'_type':'Maintenance-area'},function (err,result) {
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
        MaintenancePort.findOne({'_id':id},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        MaintenancePort.findOne({PortID:id},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }

};

exports.updateMaintenanceport =function (id,record,callback) {
    if(isNaN(id))
    {
        MaintenancePort.findByIdAndUpdate(id,record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        MaintenancePort.findOneAndUpdate({PortID:id},record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
};