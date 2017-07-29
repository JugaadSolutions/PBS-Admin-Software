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
    Vehicle = require('../models/vehicle'),
    Membership = require('../models/membership'),
    Fareplan = require('../models/fare-plan'),
    Users= require('../models/user');

var cleanstation = require('../models/stationcleaning'),
    notcleanedStation = require('../models/station-not-cleaned');

var DockService = require('../services/docking-port-service');


/*exports.createDS = function (record,callback) {
    var stationDetails;
    var stationDetailsUpdated;
    var allportInfo=[];
    
    async.series([
        function (callback) {
            DockStation.create(record,function (err,result) {
                if(err)
                {
                    if (err.name === 'MongoError' && err.code === 11000) {
                        // Duplicate username
                        err.name = 'UniqueFieldError';
                        err.message = 'Station name, Ipaddress and subnet fields must be unique, please check your inputs';
                        err.statusCode=400;
                        return callback(err,null);
                    }else {
                        return callback(err, null);
                    }
                }
                stationDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            // var j=1;
            var count = Number(stationDetails.noofPorts)/4;
            for (var i = 3; i < 3+(count); i++) {

                /!*if (j > 4) {
                 j = 1;
                 }*!/
                for(var port=1;port<=4;port++) {
                    var portsDetails = {
                        StationId: stationDetails._id,
                        FPGA: i,
                        ePortNumber: port,
                        DockingStationName:stationDetails.name,
                        Name: stationDetails.name +"-Unit-"+i+" PORT-" + port
                    };

                    DockService.createPort(portsDetails, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }

                        /!* DockStation.findById(stationDetails._id,function (err,rec) {
                         if(err)
                         {
                         return callback(err,null);
                         }*!/

                        var portInfo = {
                            dockingPortId: result._id
                        };
                        allportInfo.push(portInfo);
                        if(allportInfo.length==stationDetails.noofPorts)
                        {
                            callback(null,allportInfo);
                        }
/!*                        stationDetails.portIds.push(portInfo);
                        DockStation.findByIdAndUpdate(stationDetails._id, stationDetails, function (err, records) {
                            if (err) {
                                return callback(err, null);
                            }
                            //stationDetails=records;
                            stationDetailsUpdated = records;
                            // return callback(null,records);
                        });*!/


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
         },


        function (callback) {
            Membership.update({},{$push:{unsuccessIp:stationDetailsUpdated.ipAddress}},{ multi: true },function (err,result) {
                if(err)
                {
                    //return console.error('Unable to push data to users while creating dock-station');
                    return callback(err,null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            Fareplan.update({},{$push:{unsuccessIp:stationDetailsUpdated.ipAddress}},{ multi: true },function (err,result) {
                if(err)
                {
                    //return console.error('Unable to push data to users while creating dock-station');
                    return callback(err,null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            Users.update({},{$push:{unsuccessIp:stationDetailsUpdated.ipAddress}},{ multi: true },function (err,result) {
                if(err)
                {
                    //return console.error('Unable to push data to users while creating dock-station');
                    return callback(err,null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            Vehicle.update({},{$push:{unsyncedIp:stationDetailsUpdated.ipAddress}},{ multi: true },function (err,result) {
                if(err)
                {
                    //return console.error('Unable to push data to users while creating dock-station');
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
        
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,stationDetailsUpdated);
    });


};*/
exports.createDS = function (record,callback) {
    var stationDetails;
    var stationDetailsUpdated;
    var allportInfo=[];
    var portArray = [];

    async.waterfall([
        function (callback) {
            DockStation.create(record,function (err,result) {
                if(err)
                {
                    if (err.name === 'MongoError' && err.code === 11000) {
                        // Duplicate username
                        err.name = 'UniqueFieldError';
                        err.message = 'Station name, Ipaddress and subnet fields must be unique, please check your inputs';
                        err.statusCode=400;
                        return callback(err,null);
                    }else {
                        return callback(err, null);
                    }
                }
                stationDetails=result;
                return callback(null,stationDetails);
            });
        },
        function (stationDetails,callback) {
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
                        DockingStationName:stationDetails.name,
                        Name: stationDetails.name +"-Unit-"+i+" PORT-" + port
                    };
                    portArray.push(portsDetails);
                    if(i==(3+(count))-1 && port==4)
                    {
                        DockService.createPort(portArray, function (err, result) {
                            if (err) {
                                return callback(err, null);
                            }
                            if(result.length>0)
                            {
                                for(var k=0;k<result.length;k++)
                                {
                                    var portInfo = {
                                        dockingPortId: result[k]._id
                                    };
                                    allportInfo.push(portInfo);
                                    if(k==result.length-1)
                                    {
                                        return callback(null,allportInfo);
                                    }
                                }
                            }
                            else
                            {
                                return callback(new Error('No ports created'),null);
                            }
                        });
                    }

                }
                // j = j + 1;
            }

            //callback(null,allportInfo);
        },
        function (allportInfo,callback) {
            if(allportInfo.length>0)
            {
                for(var i=0;i<allportInfo.length;i++)
                {
                    stationDetails.portIds.push(allportInfo[i]);
                    if(i==allportInfo.length-1)
                    {
                        DockStation.findByIdAndUpdate(stationDetails._id, stationDetails,{new:true}, function (err, records) {
                            if (err) {
                                return callback(err, null);
                            }
                            //stationDetails=records;
                            stationDetailsUpdated = records;
                            return callback(null,stationDetailsUpdated);
                        });
                    }
                }

            }
            else
            {
                return callback(null,null);
            }
        },


        function (stationDetailsUpdated,callback) {
            if(stationDetailsUpdated)
            {
                Membership.update({},{$push:{unsuccessIp:stationDetailsUpdated.ipAddress}},{ multi: true },function (err,result) {
                    if(err)
                    {
                        //return console.error('Unable to push data to users while creating dock-station');
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (result,callback) {
            if(stationDetailsUpdated)
            {
                Fareplan.update({},{$push:{unsuccessIp:stationDetailsUpdated.ipAddress}},{ multi: true },function (err,result) {
                    if(err)
                    {
                        //return console.error('Unable to push data to users while creating dock-station');
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (result,callback) {
            if(stationDetailsUpdated) {
                Users.update({}, {$push: {unsuccessIp: stationDetailsUpdated.ipAddress}}, {multi: true}, function (err, result) {
                    if (err) {
                        //return console.error('Unable to push data to users while creating dock-station');
                        return callback(err, null);
                    }
                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function (result,callback) {
            if(stationDetailsUpdated) {
                Vehicle.update({}, {$push: {unsyncedIp: stationDetailsUpdated.ipAddress}}, {multi: true}, function (err, result) {
                    if (err) {
                        //return console.error('Unable to push data to users while creating dock-station');
                        return callback(err, null);
                    }
                    return callback(null, result);
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
        return callback(null,stationDetailsUpdated);
    });


};

exports.getAllStations = function (record,callback) {

    var allstations=[];

    DockStation.find({stationType: "dock-station"}).deepPopulate('portIds portIds.dockingPortId portIds.dockingPortId.vehicleId.vehicleid').lean().exec(function (err,result) {
        if(err)
        {
           return callback(err,null);
        }
        if(!result)
        {
            return callback(new Error('No Docking Hub found. Please create docking hub.'),null);
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
               subnet:0,
               modelType:'',
               template:'',
               minAlert:0,
               maxAlert:0,
               zoneId:'',
               operationStatus:0,
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
            details.subnet=data.subnet;
            details.modelType=data.modelType;
            details.template=data.template;
            details.minAlert=data.minAlert;
            details.maxAlert=data.maxAlert;
            details.zoneId=data.zoneId;
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
        bicycleCount:0,
        modelType:''
    };
    DockStation.findOne({'_id': id}).deepPopulate('portIds portIds.dockingPortId portIds.dockingPortId.vehicleId.vehicleid').lean().exec(function (err,result) {
        if (err) {
            return callback(err, null);
        }
        if(result)
        {
            details.modelType = result.modelType;
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
        }
        else
        {
            return callback(null,null);
        }

    });
};

exports.updateDockstation = function (id,record,callback) {
    if(isNaN(id))
    {
        DockStation.findByIdAndUpdate(id,record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        DockStation.findOneAndUpdate({StationID:id},record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
};

exports.createCleanedEntry = function (record,callback) {
    //record.cleaneddate = moment(record.cleaneddate);
    //record.fromtime=moment(record.fromtime);
    //record.totime=moment(record.totime);
   // record.stationId = record.stationIdnew;
    var cleanedStation;
    async.series([

        function (callback) {
        if(record.stationIdnew && !isNaN(record.stationIdnew) )
        {
            DockStation.findOne({StationID:record.stationIdnew},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error('No station found by the given id'),null);
                }
                record.stationId = result._id;
                return callback(null,result);
            });
        }
        else
        {
            return callback(null,null);
        }
        },
        function (callback) {
            if(record.cleaneddate)
            {
                var fdate = moment(record.cleaneddate);
                fdate=fdate.format('YYYY-MM-DD');
                cleanstation.find({stationId:record.stationId,cleaneddate:fdate},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(result.length>0)
                    {
                        record.cleanCount = result.length+1;
                        return callback(null,result);
                    }
                    else
                    {
                        return callback(null,null);
                    }

                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {
            if(record.createdBy)
            {
                Users.findOne({UserID:record.createdBy},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error('Logged in user not found'),null);
                    }
                    record.createdBy = result._id;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            //record.fromtime=moment(record.fromtime);
            //record.totime = moment(record.totime);
            cleanstation.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                cleanedStation = result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,cleanedStation);
    });
};

exports.getcleanStationsById = function (id,callback) {
    if(isNaN(id))
    {
        cleanstation.findOne({'_id':id}).deepPopulate('stationId empId').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        cleanstation.findOne({UserID:id}).deepPopulate('stationId empId').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }

};

exports.getCleanedstatrec = function (record,callback) {
    if(record.fromdate && record.todate)
    {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        cleanstation.find({cleaneddate:{$gte:moment(fdate),$lte:moment(ldate)}}).sort('-fromtime').deepPopulate('stationId empId').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        return callback(new Error('Please provide from date and to date both'));
    }
};

/*exports.createNotCleanedEntry = function (record,callback) {

    async.series([
        function (callback) {

        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    })
};*/






