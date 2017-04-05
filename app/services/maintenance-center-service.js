/**
 * Created by root on 6/10/16.
 */
// Third Party Dependencies
var async = require('async')
    /*config = require('config'),
     request = require('request')*/;
var MaintenanceDetails = require('../models/maintenance-details'),
    RepairDetails = require('../models/repair-details'),
    User = require('../models/user'),
    Vehicle = require('../models/vehicle'),
    Station = require('../models/station'),
    Ports = require('../models/port'),
    Messages = require('../core/messages'),
    MaintenanceCenter=require('../models/maintenance-center');



exports.createDS = function (record,callback) {

    MaintenanceCenter.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateMaintenancecenter = function (id,record,callback) {
    if(isNaN(id))
    {
        MaintenanceCenter.findByIdAndUpdate(id,record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        MaintenanceCenter.findOneAndUpdate({StationID:id},record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }

};

exports.createMaintenance = function (record,callback) {
    var maintenanceDetails;
    async.series([
        function (callback) {
            User.findOne({UserID:record.employeeId},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error('No employee found by this id'),null);
                }
                record.employeeId =result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            User.findOne({UserID:record.createdBy},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error('Logged in user id missing'),null);
                }
                record.createdBy =result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            if(record.origin)
            {
                Station.findOne({StationID:record.location},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error("Couldn't able to find station by the given location"),null);
                    }
                    record.location = result._id;
                    return callback(null,result);
                });
            }
            else
            {
                Ports.findOne({PortID:record.location},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error("Couldn't able to find maintenance centre by the given location"),null);
                    }
                    record.location = result._id;
                    return callback(null,result);
                });
            }
        }
        ,
        function (callback) {
            Vehicle.findOne({$or:[{vehicleNumber: record.vehicleId},{vehicleRFID:record.vehicleId}]},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.VEHICLE_NOT_FOUND),null);
                }
                record.vehicleId = result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            MaintenanceDetails.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null)
                }
                maintenanceDetails = result;
                return callback(null,result);
            });
        },
        function (callback) {
            Vehicle.findById(record.vehicleId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                var data = {
                    detailsId:result._id
                };
                result.maintenance.push(data);
                Vehicle.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,maintenanceDetails);
    })
};

exports.createRepair = function (record,callback) {
    var repairDetails;
    async.series([
        function (callback) {
            User.findOne({UserID:record.employeeId},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error('No employee found by this id'),null);
                }
                record.employeeId =result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            User.findOne({UserID:record.createdBy},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error('Logged in user id missing'),null);
                }
                record.createdBy =result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            if(record.origin)
            {
                Station.findOne({StationID:record.location},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error("Couldn't able to find station by the given location"),null);
                    }
                    record.location = result._id;
                    return callback(null,result);
                });
            }
            else
            {
                Ports.findOne({PortID:record.location},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error("Couldn't able to find maintenance centre by the given location"),null);
                    }
                    record.location = result._id;
                    return callback(null,result);
                });
            }
        }
        ,
        function (callback) {
            Vehicle.findOne({$or:[{vehicleNumber: record.vehicleId},{vehicleRFID:record.vehicleId}]},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.VEHICLE_NOT_FOUND),null);
                }
                record.vehicleId = result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            RepairDetails.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null)
                }
                repairDetails = result;
                return callback(null,result);
            });
        },
        function (callback) {
            Vehicle.findById(record.vehicleId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                var data = {
                    detailsId:repairDetails._id
                };
                result.repairs.push(data);
                Vehicle.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,repairDetails);
    })
};