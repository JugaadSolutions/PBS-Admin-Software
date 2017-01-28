/**
 * Created by root on 9/1/17.
 */

/*
var async = require('async'),
    Users = require('../models/user'),
    RequestService = require('./request-service'),
     RapidQueue = require('rapid-queue'),
    userqueue = require('block-queue'),
    moment = require('moment'),
    vehiclequeue = require('block-queue'),
    Vehicles = require('../models/vehicle'),
    DockStation = require('../models/dock-station');
//var userqueue = RapidQueue.createQueue();

exports.startUserSync = function (time,callback) {
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
/!*        function (callback) {
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
        }*!/
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
};

exports.startVehicleSync = function (callback) {
    var DSCount=0;
    var allUsers;
    var allVehicles;
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
            Vehicles.find({updateCount:{$ne:DSCount}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                allVehicles=result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(allVehicles.length>0)
            {
                for(var j=0;j<allVehicles.length;j++)
                {
                    console.log('Vehicle Queue : '+VehiclesQueue.reducer.length);
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
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    })
};

var UsersQueue = userqueue(1,function (task,done) {
    var User = task;
    var synced=[];
    var init = User.updateCount;
    var count = User.updateCount;
    var unsynced = [];
    var temp=0;


    synced= User.successIp;
    //unsynced = User.unsuccessIp;
    //console.log(unsynced.toString());

    async.series([
        function (callback) {
            async.forEach(User.unsuccessIp,function (unsyncIp) {
                var httpMethod = 'POST',
                    uri = 'member',
                    ip =unsyncIp,
                    requestBody =User;
                RequestService.requestHandler(httpMethod,uri,ip,requestBody,function (err,result) {
                    if (err) {
                        console.log('User Sync Connection Error : IP - ' + unsyncIp);
                        unsynced.push(unsyncIp);
                        temp=temp+1;
                    }
                    if (result) {
                        synced.push(unsyncIp);
                        count = count+1;
                        temp=temp+1;
                    }
                    if(temp==User.unsuccessIp.length)
                    {
                         return callback(null,null);
                    }
                });
            },function (err) {
                if(err)
                {
                    console.error('Error User sync : '+err );
                }
            });

        },
        function (callback) {

            if(count!=init)
            {
                    Users.findOne(User._id,function (err,result) {
                    if(err)
                    {
                        return console.error('Error finding user after sync : '+err);
                    }
                    result.updateCount = count;
                    result.unsuccessIp=unsynced;
                    result.successIp=synced;
                        Users.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                        if(err)
                        {
                            return console.error('Error updating after sync : '+err);
                       // done();
                        }
                    //done();
                        return callback(null,result);
                    });
                });
            }
            else
            {
                UsersQueue.push(User);
                return callback(null,null);
            }
        }
    ],function (err,result) {
        if(err)
        {
            done();
        }
        done();
    });
});

var VehiclesQueue = vehiclequeue(1,function (task,done) {
    var Vehicle = task;
    var synced=[];
    var init = Vehicle.updateCount;
    var count = Vehicle.updateCount;
    var unsynced = [];
    var temp=0;
    synced= Vehicle.syncedIp;
    //unsynced = User.unsuccessIp;
    //console.log(unsynced.toString());

        async.series([
     function (callback) {
    async.forEach(Vehicle.unsyncedIp,function (unsyncIp) {
        var httpMethod = 'POST',
            uri = 'vehicle',
            ip =unsyncIp,
            requestBody =Vehicle;
        RequestService.requestHandler(httpMethod,uri,ip,requestBody,function (err,result) {
            if (err) {
                console.log('Vehicle Sync Connection Error : IP - ' + unsyncIp);
                unsynced.push(unsyncIp);
                temp=temp+1;
            }
            if (result) {
                synced.push(unsyncIp);
                /!*for(var j=0;j<User.unsuccessIp.length;j++)
                 {
                 if(unsynced[j]==unsyncIp)
                 {
                 unsynced.splice(j,1);
                 break;
                 }

                 }*!/
                count = count+1;
                temp=temp+1;

            }
            if(temp==Vehicle.unsyncedIp.length)
            {
                return callback(null,null);
/!*                Vehicles.findOne(Vehicle._id,function (err,result) {
                    if(err)
                    {
                        return console.error('Error finding user after sync : '+err);
                    }
                    result.updateCount = result.updateCount+count;
                    result.unsyncedIp=unsynced;
                    result.syncedIp=synced;
                    Vehicles.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                        if(err)
                        {
                            return console.error('Error updating after sync : '+err);
                            done();
                        }
                        done();
                        //return callback(null,result);
                    });
                });*!/
            }
        });
    },function (err,result) {
        if(err)
        {
            console.error('Error User sync : '+err );
        }
        //return callback(null,result);
    });

            },
     function (callback) {
                if(count!=init)
                {
                    Vehicles.findOne(Vehicle._id,function (err,result) {
                        if(err)
                        {
                            return console.error('Error finding user after sync : '+err);
                        }
                        result.updateCount = count;
                        result.unsyncedIp=unsynced;
                        result.syncedIp=synced;
                        Vehicles.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                            if(err)
                            {
                                return console.error('Error updating after sync : '+err);
                                //done();
                            }
                            //done();
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
            done();
        }
        done();
     });
//    console.log('Synced IP : '+synced.toString());
//    console.log('UnSynced IP : '+synced.toString());

});

/!*
exports.startUserSync = function (callback) {
    var DSCount=0;
    var allUsers;
    var lastSyncedTime=null;
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
                    return callback(null,result);
                });
            }
        },
        function (callback) {
            if(allUsers.length>0)
            {
                for(var i=0;i<allUsers.length;i++)
                {
                    // console.log('Vehicle Queue : '+UsersQueue.reducer.length);

                    userqueue.push(allUsers[i]);
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
        },
        function (callback) {
            var length = userqueue.length();
            if(length>0)
            {

            while(length>0)
            {
                //console.log('Queue Length : '+length);
                var front = userqueue.front();
                var User = front;
                var synced=[];
                var init = User.updateCount;
                var count = User.updateCount;
                var unsynced = [];
                var temp=0;
                synced= User.successIp;
                async.forEach(User.unsuccessIp,function (unsyncIp) {
                    var httpMethod = 'POST',
                        uri = 'member',
                        ip =unsyncIp,
                        requestBody =User;
                    RequestService.requestHandler(httpMethod,uri,ip,requestBody,function (err,result) {
                        if (err) {
                            console.log('User Sync Connection Error : IP - ' + unsyncIp);
                            unsynced.push(unsyncIp);
                            temp=temp+1;

                        }
                        if (result) {
                            synced.push(unsyncIp);
                            count = count+1;
                            temp=temp+1;
                        }
                        if(temp==User.unsuccessIp.length)
                        {
                            //return callback(null,null);
                            Users.findOne(User._id,function (err,result) {
                                if(err)
                                {
                                    return console.error('Error finding user after sync : '+err);
                                }
                                result.updateCount = count;
                                result.unsuccessIp=unsynced;
                                result.successIp=synced;
                                Users.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                                    if(err)
                                    {
                                        length=length-1;
                                        userqueue.push(User);
                                        return console.error('Error updating after sync : '+err);
                                    }
                                    if(result)
                                    {
                                        length=length-1;
                                        userqueue.shift();
                                    }
                                });
                            });

                        }
                    });
                },function (err) {
                    if(err)
                    {
                        console.error('Error User sync : '+err );
                    }
                });
                //return callback(null,length);
/!*                if(count!=init)
                {

                }*!/

            }

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
        return callback(null,result);
    })
};*!/
*/
