/**
 * Created by root on 6/10/16.
 */
// Third Party Dependencies
var async = require('async'),
    moment = require('moment')
    /*config = require('config'),
    request = require('request')*/;
var DockStation=require('../models/dock-station'),
    Messages = require('../core/messages'),
    Constants = require('../core/constants'),
    DockPort= require('../models/dock-port');

var cleanstation = require('../models/stationcleaning');

var DockService = require('../services/docking-port-service');
// Application Level Dependencies
/*var DockingStation = require('../models/docking-station'),
    Member = require('../models/user'),
    Vehicle = require('../models/vehicle'),
    DockingUnit = require('../models/docking-unit'),
    DockingPort = require('../models/docking-port'),

    DockingUnitService = require('../services/docking-unit-service'),

    //RequestHandler = require('../handlers/request-handler'),
    Messages = require('../core/messages');*/

// Method to create docking station
/*
exports.createStation = function (record, callback) {

    var dockingStation;
    var dockingStationObject;

    async.series([

            // Step 1: Method to create docking station
            function (callback) {

               /!* var newRecord = DockingStation(record);

                newRecord.save(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    dockingStationObject = {
                        stationNumber: result.stationNumber,
                        name: result.name,
                        stationIPAddress: result.ipAddress,
                        ipAddress: [],
                        serverReferenceId: result._id,
                        dockingStationId: result._id,
                        status: result.status
                    };

                    dockingStation = result;
                    return callback(null, result);

                });*!/

                dockingStationObject = {
                    stationNumber: record.stationNumber,
                    name: record.name
                    /!*stationIPAddress: result.ipAddress,
                    ipAddress: [],
                    serverReferenceId: result._id,
                    dockingStationId: result._id,
                    status: result.status*!/
                };
                DockingStation.create(dockingStationObject,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    dockingStation=result;
                    return callback(null,result);
                });

            }/!*,

            // Step 2: Method to update local bridges
            function (callback) {

                var httpMethod = 'POST',
                    uri = 'dockingstation';

                RequestHandler.updateLocalBridges(dockingStationObject, httpMethod, uri);
                return callback(null, null);

            }*!/
        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, dockingStation);

        });

};*/


exports.createDS = function (record,callback) {
    var stationDetails;
    var stationDetailsUpdated;
    var allportInfo=[];
    
    async.series([
        function (callback) {
            DockStation.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                stationDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            // var j=1;
            var count = Number(stationDetails.noofPorts)/4;
            for (var i = 3; i < 3+(count); i++) {

                /*if (j > 4) {
                 j = 1;
                 }*/
                for(var port=1;port<=4;port++) {
                    var portsDetails = {
                        StationId: stationDetails._id,
                        FPGA: i,
                        ePortNumber: port,
                        Name: stationDetails.name +"Unit-"+i+" PORT -" + port
                    };

                    DockService.createPort(portsDetails, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }

                        /* DockStation.findById(stationDetails._id,function (err,rec) {
                         if(err)
                         {
                         return callback(err,null);
                         }*/

                        var portInfo = {
                            dockingPortId: result._id
                        };
                        allportInfo.push(portInfo);
                        if(allportInfo.length==stationDetails.noofPorts)
                        {
                            callback(null,allportInfo);
                        }
/*                        stationDetails.portIds.push(portInfo);
                        DockStation.findByIdAndUpdate(stationDetails._id, stationDetails, function (err, records) {
                            if (err) {
                                return callback(err, null);
                            }
                            //stationDetails=records;
                            stationDetailsUpdated = records;
                            // return callback(null,records);
                        });*/


                        //});
                    });
                }
                // j = j + 1;
            }

            //callback(null,allportInfo);
        },
         function (callback) {
            if(allportInfo.length>0)
            {
                for(var i=0;i<allportInfo.length;i++)
                {
                    stationDetails.portIds.push(allportInfo[i]);
                }
                DockStation.findByIdAndUpdate(stationDetails._id, stationDetails,{new:true}, function (err, records) {
                    if (err) {
                        return callback(err, null);
                    }
                    //stationDetails=records;
                    stationDetailsUpdated = records;
                    return callback(null,records);
                });
            }
         }
        
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,stationDetailsUpdated);
    });


};

exports.getAllStations = function (record,callback) {

    var allstations=[];

    DockStation.find({"stationType": "dock-station"}).deepPopulate('portIds portIds.dockingPortId portIds.dockingPortId.vehicleId.vehicleid').lean().exec(function (err,result) {
        if(err)
        {
           return callback(err,null);
        }
        for(var i=0;i<result.length;i++)
        {
            var data = result[i];
           var details = {
               _id:'',
               StationID:'',
               stationType:'',
               name:'',
               ipAddress:'',
               stationNumber:'',
               noofUnits:'',
               noofPorts:'',
               gpsCoordinates:'',
               portIds:'',
               stationStatus:'',
               operationStatus:'',
               bicycleCapacity:0,
               bicycleCount:0
           };
           details._id=data._id;
            details.StationID=data.StationID;
            details.stationType=data.stationType;
            details.name=data.name;
            details.ipAddress=data.ipAddress;
            details.stationNumber=data.stationNumber;
            details.noofUnits=data.noofUnits;
            details.noofPorts=data.noofPorts;
            details.gpsCoordinates=data.gpsCoordinates;
            details.portIds=data.portIds;
            details.stationStatus=data.stationStatus;
            details.operationStatus=data.operationStatus;
            details.bicycleCapacity=data.portIds.length;
                for(var j=0;j<data.portIds.length;j++)
                {
                    var ports=data.portIds[j];
                    if(ports.dockingPortId.portStatus==Constants.AvailabilityStatus.FULL)
                    {
                        details.bicycleCount = details.bicycleCount+1;
                    }
                }
            allstations.push(details);
        }
        return callback(null,allstations);

    });

};

exports.getstationdetail = function (id,callback) {

    var details ={
        _id:'',
        bicycleCapacity:'',
        bicycleCount:0
    };
    DockStation.findOne({'_id': id}).deepPopulate('portIds portIds.dockingPortId portIds.dockingPortId.vehicleId.vehicleid').lean().exec(function (err,result) {
        if (err) {
            return callback(err, null);
        }
        details.bicycleCapacity=result.portIds.length;
        details._id = result._id;
        for(var j=0;j<result.portIds.length;j++)
        {
            var ports=result.portIds[j];
            if(ports.dockingPortId.portStatus==Constants.AvailabilityStatus.FULL)
            {
                details.bicycleCount = details.bicycleCount+1;
            }
        }
        return callback(null,details);
    });
};

exports.createCleanedEntry = function (record,callback) {
    record.cleaneddate = moment(record.cleaneddate);
    record.fromtime=moment(record.fromtime);
    record.totime=moment(record.totime);
    cleanstation.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getcleanStationsById = function (id,callback) {
    cleanstation.findOne({'_id':id}).deepPopulate('stationId empId').lean().exec(function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getCleanedstatrec = function (callback) {
  cleanstation.find({}).sort('-cleaneddate').deepPopulate('stationId empId').lean().exec(function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,result);
  });
};












