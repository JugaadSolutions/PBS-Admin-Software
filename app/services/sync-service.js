/**
 * Created by root on 9/1/17.*/

var async = require('async'),
    net = require('net'),
    Users = require('../models/user'),
    Membership = require('../models/membership'),
    FarePlan = require('../models/fare-plan'),
    Station = require('../models/station'),
    Ports = require('../models/port'),
    DockPort = require('../models/dock-port'),
    RequestService = require('./request-service'),
    userqueue = require('block-queue'),
    moment = require('moment'),
    Member = require('../models/member'),
    vehiclequeue = require('block-queue'),
    Vehicles = require('../models/vehicle'),
    DockStation = require('../models/dock-station');
var Dictionary = require("dictionaryjs-es6");
var UsersDict = new Dictionary();
var VehiclesDictionary = new Dictionary(); //dictionary to hold unsynced vehicles
//var userqueue = RapidQueue.createQueue();

exports.getUsers  = function (callback) {
    var allUsers = [];
    var updateArray = [];
    async.series([
        function (callback) {
            Users.find({$where:"this.lastModifiedAt>this.lastSyncedAt"}).select('_type UserID Name smartCardKey status cardNum smartCardNumber creditBalance membershipId validity nearbyHub lastModifiedAt').deepPopulate('membershipId').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                for(var i=0;i<result.length;i++)
                {
                    allUsers.push(result[i]);
                    /* var data = {
                     _id:''
                     };
                     data._id = result[i]._id;*/
                    updateArray.push(result[i].UserID);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(updateArray.length>0)
            {
                for(var i=0;i<updateArray.length;i++)
                {
                    Users.findOneAndUpdate({UserID:updateArray[i]},{$set:{lastSyncedAt:new Date()}}).lean().exec(function (err) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                    });

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
        return callback(null,allUsers);
    })

};

exports.getVehicles  = function (callback) {
    var allVehicles = [];
    var updateArray = [];
    async.series([
        function (callback) {
            Vehicles.find({$where:"this.lastModifieddate>this.lastSyncedAt"}).select('vehicleUid vehicleNumber vehicleRFID currentAssociationId vehicleCurrentStatus vehicleStatus vehicleType lastModifieddate').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                for(var i=0;i<result.length;i++)
                {
                    result[i].lastModifiedAt= result[i].lastModifieddate;
                    allVehicles.push(result[i]);
                    /* var data = {
                     _id:''
                     };
                     data._id = result[i]._id;*/
                    updateArray.push(result[i].vehicleUid);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(updateArray.length>0)
            {
                for(var i=0;i<updateArray.length;i++)
                {
                    Vehicles.findOneAndUpdate({vehicleUid:updateArray[i]},{$set:{lastSyncedAt:new Date()}}).lean().exec(function (err) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                    });

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
        return callback(null,allVehicles);
    })

};

exports.getMembership  = function (callback) {
    var allMembership = [];
    var updateArray = [];
    async.series([
        function (callback) {
            Membership.find({$where:"this.lastModifiedAt>this.lastSyncedAt"}).select('membershipId validity userFees securityDeposit processingFees smartCardFees status farePlan lastModifiedAt').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                for(var i=0;i<result.length;i++)
                {
                    allMembership.push(result[i]);
                    /* var data = {
                     _id:''
                     };
                     data._id = result[i]._id;*/
                    updateArray.push(result[i].membershipId);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(updateArray.length>0)
            {
                for(var i=0;i<updateArray.length;i++)
                {
                    Membership.findOneAndUpdate({membershipId:updateArray[i]},{$set:{lastSyncedAt:new Date()}}).lean().exec(function (err) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                    });

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
        return callback(null,allMembership);
    })

};

exports.getFarePlan  = function (callback) {
    var allFarePlan = [];
    var updateArray = [];
    async.series([
        function (callback) {
            FarePlan.find({$where:"this.lastModifiedAt>this.lastSyncedAt"}).select('fareplanUid status plans lastModifiedAt').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                for(var i=0;i<result.length;i++)
                {
                    allFarePlan.push(result[i]);
                    /* var data = {
                     _id:''
                     };
                     data._id = result[i]._id;*/
                    updateArray.push(result[i].fareplanUid);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(updateArray.length>0)
            {
                for(var i=0;i<updateArray.length;i++)
                {
                    FarePlan.findOneAndUpdate({fareplanUid:updateArray[i]},{$set:{lastSyncedAt:new Date()}}).lean().exec(function (err) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                    });

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
        return callback(null,allFarePlan);
    })

};

exports.getStation  = function (callback) {
    var allStation = [];
    var updateArray = [];
    async.series([
        function (callback) {
            Station.find({stationType:{$eq:['dock-station','Holding-station']},$where:"this.lastModifiedAt>this.lastSyncedAt"}).select('StationID name stationType portIds operationStatus ipAddress subnet lastModifiedAt').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                for(var i=0;i<result.length;i++)
                {
                    allStation.push(result[i]);
                    /* var data = {
                     _id:''
                     };
                     data._id = result[i]._id;*/
                    updateArray.push(result[i].StationID);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(updateArray.length>0)
            {
                for(var i=0;i<updateArray.length;i++)
                {
                    Station.findOneAndUpdate({StationID:updateArray[i]},{$set:{lastSyncedAt:new Date()}}).lean().exec(function (err) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                    });

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
        return callback(null,allStation);
    })

};

exports.getPorts  = function (callback) {
    var allPorts = [];
    var updateArray = [];
    async.series([
        function (callback) {
            Ports.find({_type:{$eq:['Docking-port','Holding-area']},$where:"this.lastModifiedAt>this.lastSyncedAt"}).select('_type PortID StationId vehicleId portStatus portCapacity FPGA ePortNumber DockingStationName').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                for(var i=0;i<result.length;i++)
                {
                    allPorts.push(result[i]);
                    /* var data = {
                     _id:''
                     };
                     data._id = result[i]._id;*/
                    updateArray.push(result[i].PortID);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(updateArray.length>0)
            {
                for(var i=0;i<updateArray.length;i++)
                {
                    DockPort.findOneAndUpdate({PortID:updateArray[i]},{$set:{lastSyncedAt:new Date()}}).lean().exec(function (err) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                    });

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
        return callback(null,allPorts);
    })

};

exports.syncAll = function (callback) {

    async.series([
        function (callback) {
            Users.update({}, {$set:{lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}}, {multi: true}, function (err, result) {
                if (err) {
                    //return console.error('Unable to push data to users while creating dock-station');
                    return callback(err, null);
                }
                return callback(null, result);
            });
        },
        function (callback) {
            Vehicles.update({}, {$set:{lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}}, {multi: true}, function (err, result) {
                if (err) {
                    //return console.error('Unable to push data to users while creating dock-station');
                    return callback(err, null);
                }
                return callback(null, result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,"Sync Initiated");
    })
};

exports.syncUser = function (id,callback) {
    Users.update({cardNum:id}, {$set:{lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}}, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, "User sync initiated");
    });
};

exports.syncAllUser = function (callback) {
    Users.update({status:{$ne:0}}, {$set:{lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}}, {multi: true}, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, "Users sync initiated");
    });
};

exports.syncVehicle = function (id,callback) {
    Vehicles.update({vehicleNumber:id}, {$set:{lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}}, function (err, result) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, "Vehicle sync initiated");
    });
};

exports.syncAllVehicle = function (callback) {
    Vehicles.update({}, {$set:{lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}}, {multi: true}, function (err, result) {
        if (err) {

            return callback(err, null);
        }
        return callback(null, "Vehicle sync initiated");
    });
};

exports.resetElectronics = function (record,callback) {

    var HOST = record.host;
    var PORT = 6969;
    var client = new net.Socket();
    client.connect(PORT, HOST, function() {

        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        client.write('reset');

    });

    client.on('data', function(data) {
        console.log('DATA: ' + data);
        client.destroy();
    });

    client.on('error',function (err) {
        console.error("Error while sending to socket"+err);
        return callback(new Error('Error while sending data to docking station'),null);
    });

    client.on('close', function() {
        console.log('Connection closed');
        return callback(null,"Reset initiated");
    });

};






exports.startUserSync = function (callback) {
    var DSCount=0;
    var allUsers;
    var Ips = [];
    async.series([
        function (callback) {
            DockStation.find({'stationType':'dock-station'},'ipAddress',function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                DSCount=result.length;
                Ips = result;
                //console.log('DS count : '+DSCount);
                return callback(null,result);
            });
        },
        function (callback) {
            Member.find(/*{updateCount:{$ne:DSCount},smartCardNumber:{$ne:''},*/{$where:"this.lastModifiedAt>this.lastSyncedAt"}).deepPopulate('membershipId').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                allUsers=result;
                return callback(null,result);
            });
        },
        function (callback) {
            Users.find(/*{updateCount:{$ne:DSCount},smartCardNumber:{$ne:''},*/{$where:"this.lastModifiedAt>this.lastSyncedAt"}).deepPopulate('membershipId').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                for(var i=0;i<result.length;i++)
                {
                    allUsers.push(result[i]);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(allUsers.length>0)
            {
                for(var i=0;i<allUsers.length;i++)
                {
                    var user = allUsers[i];
                    //var id = user.UserID.toString();
                    if(user._type=='member')
                    {


                        var userData = {
                            UserID:user.UserID,
                            _type:user._type,
                            Name:user.Name,
                            cardNum:user.cardNum,
                            smartCardNumber:user.smartCardNumber,
                            vehicleId:user.vehicleId,
                            status:user.status,
                            membershipId:0,
                            validity:user.validity,
                            creditBalance:user.creditBalance,
                            unsuccessIp:user.unsuccessIp
                        };
                        if(user.membershipId)
                        {
                            userData.membershipId = user.membershipId.membershipId;
                        }
                    }
                    else
                    {
                        var userData = {
                            UserID:user.UserID,
                            _type:user._type,
                            Name:user.Name,
                            cardNum:user.cardNum,
                            smartCardNumber:user.smartCardNumber,
                            vehicleId:user.vehicleId,
                            status:user.status,
                            unsuccessIp:user.unsuccessIp
                        };
                    }

                    UsersDict.set(userData.UserID,userData);
                    if(i==allUsers.length-1)
                    {
                        return callback(null,null);
                    }
                }
                //console.log(UsersDict.size());
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            //console.log(UsersDict.get(2));

            UsersDict.forEach(function(key,value) {
                /// console.log(key,value);
                value.unsuccessIp.forEach(function(ip){
                    //console.log(ip.ipAddress);
                    var httpMethod = 'POST',
                        uri = 'member',
                        ip =ip,
                        requestBody =value ;
                    RequestService.requestHandler(httpMethod,uri,ip,requestBody,function (err,req,result) {
                        if(err)
                        {
                            console.error('User Connection Error : IP - '+ip);
                            //unsuccess.push(req.unsuccessIp[j]);
                            //continue
                            //return callback(err,null);
                        }
                        if(result) {
                            /*                                success.push(obj.unsuccessIp[j]);
                             obj.unsuccessIp.splice(j,1);
                             obj.updateCount = obj.updateCount + 1;
                             if(obj.unsuccessIp.length==(j))
                             {
                             Users.findOne({smartCardNumber:obj.smartCardNumber},function (err,result) {
                             if(err)
                             {
                             console.error('Error in users after getting response');
                             }
                             if(result)
                             {
                             result.updateCount = obj.updateCount;
                             result.unsuccessIp=obj.unsuccessIp;
                             result.successIp=success;
                             Users.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                             if(err)
                             {
                             console.error('Error in Updating user after getting response');
                             }
                             });
                             }
                             });
                             }*/
                            Users.findOne({UserID:result.UserID},function (err,result) {
                                if(err)
                                {
                                    return callback(err,null);
                                }
                                var ipList = result.unsuccessIp;
                                var ipIndex = ipList.indexOf(ip);
                                result.unsuccessIp = ipList.splice(ipIndex,1);
                                result.updateCount=result.updateCount+1;
                                if(result.updateCount==DSCount)
                                {
                                    result.lastSyncedAt = new Date();
                                }
                                Users.findByIdAndUpdate(result._id,result,function (err,result) {
                                    if(err)
                                    {
                                        console.error('Error in Updating user after getting response');
                                    }
                                });
                            });

                        }
                    });
                });
            });
            return callback(null,null);

        }
    ],function (err,result) {
        console.log("User Sync Cycle Completed");
        if(err)
        {
            UsersDict.empty();
            return callback(err,null);
        }
        UsersDict.empty();
        return callback(null,result);
    })
};
/*exports.startUserSync = function (time,callback) {
 var DSCount=0;
 var allUsers;
 var allVehicles;
 var lastSyncedTime=time;
 async.series([
 function (callback) {
 DockStation.count({'stationType':'dock-station'},function (err,result) {
 if(err)
 {
 return callback(err,null);
 }
 DSCount=result;
 console.log('DS count : '+DSCount);
 return callback(null,result);
 });
 },
 function (callback) {
 if(lastSyncedTime==null)
 {
 lastSyncedTime=new Date();
 Users.find({updateCount:{$ne:DSCount},smartCardNumber:{$ne:''}},function (err,result) {
 if(err)
 {
 return callback(err,null);
 }
 allUsers=result;
 //UsersQueue.clear();
 return callback(null,result);
 });
 }
 else
 {
 Users.find({lastModifiedAt:{$gt:moment(lastSyncedTime)}},function (err,result) {
 if(err)
 {
 return callback(err,null);
 }
 allUsers=result;
 //UsersQueue.clear();
 lastSyncedTime=new Date();
 return callback(null,result);
 });
 }
 },
 /!*        function (callback) {
 Vehicles.find({updateCount:{$ne:DSCount}},function (err,result) {
 if(err)
 {
 return callback(err,null);
 }
 allVehicles=result;
 return callback(null,result);
 });
 },*!/
 function (callback) {
 if(allUsers.length>0)
 {
 for(var i=0;i<allUsers.length;i++)
 {
 var obj = allUsers[i];
 var success = [];
 var unsuccess = [];
 for(var j=0;j<obj.unsuccessIp.length;j++)
 {
 console.log(obj.unsuccessIp[j]);

 var httpMethod = 'POST',
 uri = 'member',
 ip =obj.unsuccessIp[j],
 requestBody =allUsers[i] ;
 RequestService.requestHandler(httpMethod,uri,ip,requestBody,function (err,req,result) {
 if(err)
 {
 console.log('User Connection Error : IP - '+obj.unsuccessIp[j]);
 //unsuccess.push(req.unsuccessIp[j]);
 //continue
 //return callback(err,null);
 }
 if(result) {
 success.push(obj.unsuccessIp[j]);
 obj.unsuccessIp.splice(j,1);
 obj.updateCount = obj.updateCount + 1;
 if(obj.unsuccessIp.length==(j))
 {
 Users.findOne({smartCardNumber:obj.smartCardNumber},function (err,result) {
 if(err)
 {
 console.error('Error in users after getting response');
 }
 if(result)
 {
 result.updateCount = obj.updateCount;
 result.unsuccessIp=obj.unsuccessIp;
 result.successIp=success;
 Users.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
 if(err)
 {
 console.error('Error in Updating user after getting response');
 }
 });
 }
 });
 }
 /!*if(obj.unsuccessIp.length==(j))
 {
 Users.findOne({smartCardNumber:result.smartCardNumber},function (err,result) {
 if(err)
 {
 console.error('Error in users after getting response');
 }
 if(result)
 {
 result.updateCount = obj.updateCount;
 result.unsuccessIp=unsuccess;
 result.successIp=success;
 Users.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
 if(err)
 {
 console.error('Error in Updating user after getting response');
 }
 });
 }
 });*!/
 }
 });
 }

 if(allUsers.length==(i-1)) {
 return callback(null, null);
 }
 }

 }
 else
 {
 return callback(null,null)
 }
 },
 function (callback) {
 if(allUsers.length>0)
 {
 for(var i=0;i<allUsers.length;i++)
 {
 // console.log('Vehicle Queue : '+UsersQueue.reducer.length);

 UsersQueue.push(allUsers[i]);
 if(i==allUsers.length-1)
 {
 return callback(null,null);
 }
 }

 }
 else
 {
 return callback(null,null);
 }
 }/!*,
 function (callback) {
 if(allVehicles.length>0)
 {
 for(var j=0;j<allVehicles.length;j++)
 {
 VehiclesQueue.push(allVehicles[j]);
 if(j==allVehicles.length-1)
 {
 return callback(null,null);
 }
 }
 }
 else
 {
 return callback(null,null);
 }
 }*!/
 ],function (err,result) {
 if(err)
 {
 return callback(err,null);
 }
 return callback(null,lastSyncedTime,result);
 })
 };*/

exports.startVehicleSync = function (callback) {
    var DSCount=0;
    var unsyncedVehicles;
    var Ips = [];
    async.series([
        function (callback) {
            DockStation.find({'stationType':'dock-station'},'ipAddress',function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                DSCount=result.length;
                Ips = result;
                //console.log('DS count : '+DSCount);
                return callback(null,result);
            });
        },
        function (callback) {
            Vehicles.find(/*{updateCount:{$ne:DSCount},smartCardNumber:{$ne:''},*/{$where:"this.lastModifieddate>this.lastSyncedAt"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                unsyncedVehicles=result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(unsyncedVehicles.length>0)
            {
                for(var i=0;i<unsyncedVehicles.length;i++)
                {
                    var vehicle = unsyncedVehicles[i];

                    VehiclesDictionary.set(vehicle.vehicleUid,vehicle);
                    if(i==unsyncedVehicles.length-1)
                    {
                        return callback(null,null);
                    }
                }
                //console.log(UsersDict.size());
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            //console.log(UsersDict.get(2));

            VehiclesDictionary.forEach(function(key,value) {
                /// console.log(key,value);
                Ips.forEach(function(ip){
                    //console.log(ip.ipAddress);
                    var httpMethod = 'POST',
                        uri = 'vehicle',
                        ip =ip.ipAddress,
                        requestBody =value ;
                    RequestService.requestHandler(httpMethod,uri,ip,requestBody,function (err,req,result) {
                        if(err)
                        {
                            console.error('User Connection Error : IP - '+ip);
                            //unsuccess.push(req.unsuccessIp[j]);
                            //continue
                            //return callback(err,null);
                        }
                        if(result) {
                            /*                                success.push(obj.unsuccessIp[j]);
                             obj.unsuccessIp.splice(j,1);
                             obj.updateCount = obj.updateCount + 1;
                             if(obj.unsuccessIp.length==(j))
                             {
                             Users.findOne({smartCardNumber:obj.smartCardNumber},function (err,result) {
                             if(err)
                             {
                             console.error('Error in users after getting response');
                             }
                             if(result)
                             {
                             result.updateCount = obj.updateCount;
                             result.unsuccessIp=obj.unsuccessIp;
                             result.successIp=success;
                             Users.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                             if(err)
                             {
                             console.error('Error in Updating user after getting response');
                             }
                             });
                             }
                             });
                             }*/
                            console.log('Vehicle Synced ');
                            result.updateCount=result.updateCount+1;
                            if(result.updateCount==DSCount)
                            {
                                result.lastSyncedAt = new Date();
                            }
                            Vehicles.findByOneAndUpdate({vehicleUid:result.vehicleUid},result,function (err,result) {
                                if(err)
                                {
                                    console.error('Error in Updating user after getting response');
                                }
                            });
                        }
                    });
                });
            });
            return callback(null,null);

        }
    ],function (err,result) {
        //       console.log("Vehicle Sync Cycle Completed");
        if(err)
        {
            VehiclesDictionary.empty();
            return callback(err,null);
        }
        VehiclesDictionary.empty();
        return callback(null,result);
    })
};