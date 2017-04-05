// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var
    MaintenancePort = require('../models/maintenance-port'),
    MaintenanceArea = require('../models/maintenance-center'),
    Stations = require('../models/station'),
    User = require('../models/user'),
    Messages = require('../core/messages');

exports.createPort=function (record,callback) {
    var MaintenanceDetails;
    async.series([
        function (callback) {
            if(isNaN(record.StationId))
            {
                return callback(null,null);
            }
            else
            {
                Stations.findOne({StationID:record.StationId},function (err,result) {
                    if(err)
                    {
                        return callback(err,null)
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
            if(record.assignedTo)
            {
                if(isNaN(record.assignedTo))
                {
                    return callback(null,null);
                }
                else
                {
                    User.findOne({UserID:record.assignedTo},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error('User not exists to assign'),null);
                        }
                        record.assignedTo = result._id;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }

        }
        ,
        function (callback) {
            if(record.assignedBy)
            {
                if(isNaN(record.assignedBy))
                {
                    return callback(null,null);
                }
                else
                {
                    User.findOne({UserID:record.assignedBy},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error('User not exists to assign'),null);
                        }
                        record.assignedBy = result._id;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }

        }
        ,
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
                MaintenanceArea.findById(MaintenanceDetails.StationId,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error('Maintenance station not found to update the new centre'),null);
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
        MaintenancePort.findById(id,function (err,result) {
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