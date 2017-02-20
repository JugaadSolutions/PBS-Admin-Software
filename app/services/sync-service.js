/**
 * Created by root on 9/1/17.*/

var async = require('async'),
    Users = require('../models/user'),
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