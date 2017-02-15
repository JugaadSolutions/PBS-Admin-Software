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
    MaintenanceCenter.findByIdAndUpdate(id,record,{new:true},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
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
                record.createdBy =result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            Vehicle.findOne({$or:[{vehicleNumber: record.vehicleId},{vehicleRFID:record.vehicleId}]},function (err,result) {
                if(err)
                {
                    return callback(err,null);
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
                record.createdBy =result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            Vehicle.findOne({$or:[{vehicleNumber: record.vehicleId},{vehicleRFID:record.vehicleId}]},function (err,result) {
                if(err)
                {
                    return callback(err,null);
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
                    detailsId:result._id
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