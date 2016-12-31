// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var RedistributionPort = require('../models/redistribution-port'),
    RedistributionVehicle = require('../models/redistribution-area'),
    Messages = require('../core/messages');



exports.createPort=function (record,callback) {
    var redistributionDetails;
    async.series([
        function (callback) {
            RedistributionPort.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                redistributionDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(redistributionDetails)
            {
                RedistributionVehicle.findOne({'_id':redistributionDetails.StationId},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    var portDetails = {
                        dockingPortId:redistributionDetails._id
                    };
                    result.portIds.push(portDetails);
                    RedistributionVehicle.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
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
        return callback(null,redistributionDetails);
    });

};

exports.getAllRecords=function (record,callback) {
  RedistributionPort.find({'_type':'Redistribution-vehicle'}).deepPopulate('StationId').lean().exec(function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,result);
  });
};

exports.getOneRecord = function (id,callback) {
    RedistributionPort.findOne({'_id':id},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateLocation=function (id,record,callback) {
    RedistributionPort.findOne({'assignedTo':id},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(result)
        {
            result.gpsCoordinates.latitude=Number(record.latitude);
            result.gpsCoordinates.longitude=Number(record.longitude);
            RedistributionPort.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
    });
};

exports.updateRedistributionport = function (id,record,callback) {
  RedistributionPort.findByIdAndUpdate(id,record,{new:true},function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,result);
  });
};