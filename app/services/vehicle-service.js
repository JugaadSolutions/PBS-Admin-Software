var async = require('async'),
    Vehicle=require('../models/vehicle'),
    Port = require('../models/port'),
    User = require('../models/user'),
    Constants = require('../core/constants'),
    Station = require('../models/station'),
    DockingStation = require('../models/dock-station'),
    Messages = require('../core/messages');

exports.addBicycle=function (record, callback) {

    var vehicleRecord;
    var fleetRecord;

    async.series([
        function (callback) {
            Port.findById(record.fleetId,function (err,result) {
            if(err)
            {
                return callback(err,null);
            }

            if(result.portCapacity==result.vehicleId.length)
            {
                return callback(new Error(Messages.FLEET_FULL));
            }
            fleetRecord = result;
            return callback();
            });
        },
        function (callback) {
            var addVehicle={
                fleetId:fleetRecord._id,
                vehicleNumber:record.vehicleNumber,
                vehicleRFID:record.vehicleRFID,
                currentAssociationId:fleetRecord._id

            };
            //record.push(addAssociation);
            Vehicle.create(addVehicle,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.RECORD_EXISTS));
                }
                vehicleRecord = result.toObject();
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findById(vehicleRecord.fleetId,function (err,result) {
           if(err)
           {
               return callback(err,null);
           }
           var vehicleDetails={
               vehicleid:vehicleRecord._id,
               vehicleUid:vehicleRecord.vehicleUid
           };
           result.vehicleId.push(vehicleDetails);
                Port.findByIdAndUpdate(result._id,result,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.RECORD_EXISTS));
                }
                return callback();
            });
        });

        },
        function (callback) {
            Station.find({stationType:'dock-station'},function (err,result) {
                if(err)
                {
                    console.log('Error fetching station');
                }
                if(result.length>0)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        vehicleRecord.unsyncedIp.push(result[i].StationID);
                    }
                    Vehicle.findByIdAndUpdate(vehicleRecord._id, vehicleRecord, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        vehicleRecord = result;
                        return callback(null, result);
                    });
                }
            });

        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,vehicleRecord);
    });
};

exports.getAllRecords=function (record,callback) {

    var vehicles;
    var ports;
    var users;
    var allDetails=[];
    async.series([
        function (callback) {
            Vehicle.find({},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                vehicles=result;
                for(var i=0;i<result.length;i++)
                {
                    var details = {
                        _id:'',
                        fleetId:'',
                        vehicleUid:'',
                        vehicleNumber:'',
                        vehicleRFID:'',
                        vehicleType:'',
                        vehicleStatus:'',
                        vehicleCurrentStatus:'',
                        currentAssociationId:'',
                        currentAssociationType:'',
                        currentAssociationName:''
                    };
                    details._id=result[i]._id;
                    details.fleetId=result[i].fleetId;
                    details.vehicleUid = result[i].vehicleUid;
                    details.vehicleNumber=result[i].vehicleNumber;
                    details.vehicleRFID=result[i].vehicleRFID;
                    details.vehicleType=result[i].vehicleType;
                    details.vehicleStatus=result[i].vehicleStatus;
                    details.vehicleCurrentStatus=result[i].vehicleCurrentStatus;
                    details.currentAssociationId=result[i].currentAssociationId;
                    //console.log(details.vehicleCurrentStatus);
                    //console.log(details.currentAssociationId);
                    allDetails.push(details);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            Port.find({},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                ports=result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.find({},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                users=result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(allDetails)
            {
                for(var i=0;i<allDetails.length;i++)
                {
                    if(allDetails[i].vehicleCurrentStatus==Constants.VehicleLocationStatus.WITH_PORT)
                    {
                        for(var j=0;j<ports.length;j++)
                        {
                            if(ports[j]._id.equals(allDetails[i].currentAssociationId))
                            {
                               // var data = ports[j];
                                //allDetails[i].currentAssociation=ports[j];
                                allDetails[i].currentAssociationType=ports[j]._type;
                                allDetails[i].currentAssociationName=ports[j].Name;
                                //console.log(ports[j]._type);
                                break;
                            }
                        }
                    }
                    else
                    {
                        for(var k=0;k<users.length;k++)
                        {
                            if(users[k]._id.equals(allDetails[i].currentAssociationId))
                            {
                                //allDetails[i].currentAssociation=users[k];
                                allDetails[i].currentAssociationType=users[k]._type;
                                allDetails[i].currentAssociationName=users[k].Name;
                                //console.log(users[k]._type);
                                break;
                            }
                        }
                    }
                }
                return callback(null,null);
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
        return callback(null,allDetails);
    });
/*    Vehicle.find({}).deepPopulate('currentAssociationId').lean().exec(function (err, result)  {
        if (err) {
            return callback(err, null);
        }
        //userDetails = result;
        //farePlanId = result.membershipId.farePlan;
        return callback(null, result);
    });*/

    /*Vehicle.find({},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });*/
};

exports.checkVehicleAvailability = function (callback) {

    var bicycleAvailabilityObject = {
        requests: []
    };

    async.series([

            // Step 1: Method to get docking station
            function (callback) {

                DockingStation.find({}).deepPopulate('portIds.dockingPortId').lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    /*for (var i = 0; i < result.length; i++)
                    {
                        var dockingStationDetailsArray = [];
                        if()
                        {
                            
                        }

                    }*/

                   /* for (var i = 0; i < result.length; i++) {

                        var dockingStationDetailsArray = [];

                        for (var j = 0; j < result[i].dockingUnitIds.length; j++) {

                            for (var k = 0; k < result[i].dockingUnitIds[j].dockingUnitId.dockingPortIds.length; k++) {

                                var object = {};

                                if (result[i].dockingUnitIds[j].dockingUnitId.dockingPortIds[k].dockingPortId.cycleRFID) {
                                    object = {
                                        portNumber: result[i].dockingUnitIds[j].dockingUnitId.dockingPortIds[k].dockingPortId.portNumber,
                                        cycleRFID: result[i].dockingUnitIds[j].dockingUnitId.dockingPortIds[k].dockingPortId.cycleRFID,
                                        portStatus: result[i].dockingUnitIds[j].dockingUnitId.dockingPortIds[k].dockingPortId.status
                                    };
                                } else {
                                    object = {
                                        portNumber: result[i].dockingUnitIds[j].dockingUnitId.dockingPortIds[k].dockingPortId.portNumber,
                                        cycleRFID: "0000000000000000",
                                        portStatus: result[i].dockingUnitIds[j].dockingUnitId.dockingPortIds[k].dockingPortId.status
                                    };
                                }

                                dockingStationDetailsArray.push(object);

                            }

                        }

                        var dockingStation = {
                            dockingStationName: result[i].name,
                            dockingStationId: result[i]._id,
                            bicycleCount: result[i].bicycleCount,
                            bicycleCapacity: result[i].bicycleCapacity,
                            modelType: result[i].modelType,
                            status: result[i].status,
                            noOfDockingUnits: result[i].noOfDockingUnits,
                            ipAddress: result[i].ipAddress,
                            dockingStationDetails: dockingStationDetailsArray
                        };

                        bicycleAvailabilityObject.requests.push(dockingStation);

                    }
*/
                    return callback(null, result);

                });

            }

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }
            //return callback(err, bicycleAvailabilityObject);
            return callback(null, result);

        }
    );
};

exports.updateVehicle = function (id,record,callback) {

    Vehicle.update({_id:id},record,{new:true},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};