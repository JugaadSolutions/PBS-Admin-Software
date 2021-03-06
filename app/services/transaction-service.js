/**
 * Created by root on 3/10/16.
 */


var async = require('async'),
    moment = require('moment'),
    CheckOut=require('../models/checkout'),
    CheckIn=require('../models/checkin'),
    CheckOutError=require('../models/checkoutError'),
    CheckInError=require('../models/checkinError'),
    vehicle = require('../models/vehicle'),
    User = require('../models/user'),
    Member = require('../models/member'),
    kpiservice = require('../services/kpi-dockstation-service'),
    DockPort=require('../models/dock-port'),
    DockStation = require('../models/dock-station'),
    Station = require('../models/station'),
    Port = require('../models/port'),
    MemberTransaction = require('../models/transaction'),
    _ = require('underscore');
 var fleet = require('../models/fleet');

var TransactionReconciliation = require('./transaction-reconciliation');

var Messages = require('../core/messages'),
    Constants = require('../core/constants');

/*
exports.createUser=function (record,callback) {
    Member.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};
*/

/*exports.checkoutApp=function (record,callback) {
var details=0;
    var requestDetails;
    var checkoutDetails;
    async.series([
        function (callback) {
            vehicle.findOne({'vehicleNumber':vehicleNumber},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
               details=result;
                return callback(null,result);
            });
        },
        function (callback) {
            if(details!=0)
            {
                requestDetails ={
                    cardId:record.cardId,
                    vehicleNumber:details.vehicleRFID,
                    fromPort:record.fromPort,
                    checkOutTime:record.checkOutTime
                };
                checkout(requestDetails,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    checkoutDetails= result;
                    return callback(null,result);
                });
            }

        }
    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,checkoutDetails);
    });



};*/

exports.getAllTransactions = function (callback) {
    var alltrans = [];
    async.series([
        function (callback) {
            CheckOut.find({'status':'Open'}).sort({'createdAt': -1}).deepPopulate('user vehicleId fromPort').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result.length>0)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        if(result[i].user._type=='member' && (result[i].fromPort._type=='Docking-port' || result[i].fromPort._type=='Redistribution-area' || result[i].fromPort._type=='Holding-area'))
                        {
                        var details={
                            _id:'',
                            user:'',
                            vehicle:'',
                            fromPort:'',
                            toPort:'-',
                            checkOutTime:'',
                            checkInTime:'-',
                            duration:'-',
                            creditBalance:'-',
                            status:'',
                            creditsUsed:'-'
                        };
                        details._id=result[i]._id;
                        details.user=result[i].user;
                        details.vehicle=result[i].vehicleId;
                        details.fromPort=result[i].fromPort;
                        details.checkOutTime=result[i].checkOutTime;
                        details.status=result[i].status;
                        alltrans.push(details);
                        }

                    }
                }
                return callback(null,result);
            });
        }/*,
        function (callback) {
            MemberTransaction.find({}).sort({'createdAt': -1}).deepPopulate('user vehicle fromPort toPort').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        if(result[i].user)
                        {
                            if(result[i].user._type)
                            {
                                if(result[i].user._type=='member' && (result[i].fromPort._type=='Docking-port' || result[i].fromPort._type=='Redistribution-area')&& (result[i].toPort._type=='Docking-port' || result[i].toPort._type=='Redistribution-area')) {
                                    alltrans.push(result[i]);
                                }
                            }
                        }
                    }
                }
                return callback(null,result);
            });

        }*/
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,alltrans);
    });

};

exports.getFewRecordsWRTMember = function (id,flag, callback) {
/*    User.findOne({UserID:id},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(result)
        {
            MemberTransaction.find({'user': result._id}).sort({'createdAt': -1}).deepPopulate('fromPort toPort').lean().exec(function (err, res) {

                if (err) {
                    return callback(err, null);
                }
                var result = [];
                res.forEach(function(r){

                    result.push({
                        'checkOutTime': moment((r.checkOutTime == null) ? '-' : (r.checkOutTime)).format('DD-MM-YYYY, h:mm:s a'),
                        'FromStation': (r.fromPort.Name == null) ? '-' : (r.fromPort.Name),
                        'ToStation': (r.toPort.Name == null) ? '-' : (r.toPort.Name),
                        'checkInTime':  moment((r.checkInTime == null) ? '-' : (r.checkInTime)).format('DD-MM-YYYY, h:mm:s a'),
                        'balance': (r.creditBalance == null) ? '-' : (r.creditBalance),
                        'fare': (r.creditsUsed == null) ? '-' : (r.creditsUsed),
                        'duration': (r.duration == null) ? '-' : (r.duration)
                    });

                });
                return callback(null, result);
            });
        }
        else
        {
            User.findOne({_id:id},function (err,result) {
                if (err) {
                    return callback(err, null);
                }
                MemberTransaction.find({'user': result._id}).sort({'createdAt': -1}).deepPopulate('fromPort toPort').lean().exec(function (err, res) {

                    if (err) {
                        return callback(err, null);
                    }
                    var result = [];
                    res.forEach(function(r){

                        result.push({
                            'checkOutTime': moment((r.checkOutTime == null) ? '-' : (r.checkOutTime)).format('DD-MM-YYYY, h:mm:s a'),
                            'FromStation': (r.fromPort.Name == null) ? '-' : (r.fromPort.Name),
                            'ToStation': (r.toPort.Name == null) ? '-' : (r.toPort.Name),
                            'checkInTime':  moment((r.checkInTime == null) ? '-' : (r.checkInTime)).format('DD-MM-YYYY, h:mm:s a'),
                            'balance': (r.creditBalance == null) ? '-' : (r.creditBalance),
                            'fare': (r.creditsUsed == null) ? '-' : (r.creditsUsed),
                            'duration': (r.duration == null) ? '-' : (r.duration)
                        });

                    });
                    return callback(null, result);
                });
            });

        }

    });*/

    var transDetails;
    var alltrans=[];
//    if (typeof id !== "number") {
    async.series([
        function(callback)
        {
            if(flag==2)
            {
                User.findOne({cardNum:id},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error(Messages.USER_NOT_FOUND),null);
                    }
                    id=result.UserID;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }/*,
        function (callback) {
            CheckOut.findOne({'status':'Open'}).sort({'createdAt': -1}).deepPopulate('user vehicleId fromPort').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                        if(result.user._type=='member' && (result.fromPort._type=='Docking-port' || result.fromPort._type=='Redistribution-area' || result.fromPort._type=='Holding-area'))
                        {
                            var details={
                                user:'',
                                vehicle:'',
                                fromPort:'',
                                toPort:'-',
                                checkOutTime:'',
                                checkInTime:'-',
                                duration:'-',
                                creditBalance:'-',
                                status:'',
                                creditsUsed:'-'
                            };
                            details.user=result.user;
                            details.vehicle=result.vehicleId;
                            details.fromPort=result.fromPort;
                            details.checkOutTime=result.checkOutTime;
                            details.status=result.status;
                            alltrans.push(details);
                        }

                }
                return callback(null,result);
            });
        }*/
        ,
        function (callback) {
            if (isNaN(id)) {
                MemberTransaction.find({'user': id}).sort({'createdAt': -1}).deepPopulate('fromPort toPort').lean().exec(function (err, res) {

                    if (err) {
                        return callback(err, null);
                    }

                    if(res.length<=0)
                    {
                        return callback(new Error("No rides found"),null);
                    }
                    var result = [];
                    res.forEach(function(r){

                        result.push({
                            'checkOutTime': moment((r.checkOutTime == null) ? '-' : (r.checkOutTime)),
                            'FromStation': (r.fromPort.Name == null) ? '-' : (r.fromPort.Name),
                            'ToStation': (r.toPort.Name == null) ? '-' : (r.toPort.Name),
                            'checkInTime':  moment((r.checkInTime == null) ? '-' : (r.checkInTime)),
                            'balance': (r.creditBalance == null) ? '-' : (r.creditBalance),
                            'fare': (r.creditsUsed == null) ? '-' : (r.creditsUsed),
                            'duration': (r.duration == null) ? '-' : (r.duration)
                        });

                    });
                    transDetails = result;
                    return callback(null, result);
                });
            }
            else
            {
                User.findOne({UserID:id},function (err,result) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (result) {
                        MemberTransaction.find({'user': result._id}).sort({'createdAt': -1}).deepPopulate('fromPort fromPort.StationId toPort  toPort.StationId').lean().exec(function (err, res) {

                            if (err) {
                                return callback(err, null);
                            }
                            if(res.length<=0)
                            {
                                return callback(new Error("No rides found"),null);
                            }
                            var result = [];
                            res.forEach(function (r) {

                                result.push({
                                    'checkOutTime': moment((r.checkOutTime == null) ? '-' : (r.checkOutTime)),
                                    'FromStation': (r.fromPort.Name == null) ? '-' : (r.fromPort.Name),
                                    'ToStation': (r.toPort.Name == null) ? '-' : (r.toPort.Name),
                                    'checkInTime': moment((r.checkInTime == null) ? '-' : (r.checkInTime)),
                                    'balance': (r.creditBalance == null) ? '-' : (r.creditBalance),
                                    'fare': (r.creditsUsed == null) ? '-' : (r.creditsUsed),
                                    'duration': (r.duration == null) ? '-' : (r.duration)
                                });

                            });
                            transDetails = result;
                            return callback(null, result);
                        });
                    }
                    else
                    {
                        return callback(null,null);
                    }

                });
            }
        }
    ],function (err,result) {
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,transDetails);
    });

    };

exports.getRecordsWRTMember = function (id,callback) {
    var data;
    async.series([
        function (callback) {
            User.findOne({cardNum:id},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.USER_NOT_FOUND),null);
                }
                id=result._id;
                return callback(null,result);
            });
        },
        function (callback) {
            MemberTransaction.find({'user': id}).sort({'createdAt': -1}).deepPopulate('user vehicle fromPort fromPort.StationId toPort  toPort.StationId').lean().exec(function (err, res) {
                if (err) {
                    return callback(err, null);
                }
                data = res;
                return callback(null,res);
            });
        }
    ],function (err,result) {
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,data);
    });
};

exports.checkout=function (record,callback) {
    var vehiclesDetails;
    var userDetails;
    var vehicleLocationStatus;
    var checkoutResultDetails;
    var checkoutDetails;
    var fromPortDetails;
    var errorstatus=0;
    var errormsg='';

    async.series([
       /* function (callback) {
            Member.findOne({'smartCardNumber':record.cardId},function (err,result) {
            if(err)
            {
                errorstatus=1;
                errormsg=errormsg+':'+err;
                return callback(err,null);
            }
            if(!result)
            {
                errorstatus=1;
                errormsg=errormsg+':'+Messages.USER_NOT_FOUND;
                return callback(new Error(Messages.USER_NOT_FOUND));
            }
            userDetails = result;
            return callback(null,result);
        });
        },
        function (callback) {
            vehicle.findOne({'vehicleRFID':record.vehicleId},function (err,result) {
                if (err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    return callback(err,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+Messages.VEHICLE_NOT_FOUND;
                    return callback(new Error(Messages.VEHICLE_NOT_FOUND));
                }
                vehiclesDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({'_id':record.fromPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    return callback(err,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+Messages.NO_PORT_FOUND;
                    return callback(new Error(Messages.NO_PORT_FOUND))
                }
                fromPortDetails=result;
                return callback(null,result);
            });

        }
        ,*/
       function (callback) {
           CheckOut.findOne(record,function (err,result) {
               if(err)
               {
                   errorstatus=1;
                   errormsg=errormsg+':'+err;
                   return callback(null,null);
               }
               if(!result)
               {
                   return callback(null,null);
               }
               errorstatus=1;
               errormsg=errormsg+': Duplicate record';
               return callback(null,null);
           });
       },
        function (callback) {
            if(errorstatus==0) {
/*                checkoutDetails={
                    user:userDetails._id,
                    vehicleId:vehiclesDetails._id,
                    fromPort:fromPortDetails._id,
                    checkOutTime:record.checkOutTime,
                    errorStatus:errorstatus,
                    errorMsg:errormsg
                };*/
                CheckOut.create(record, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    checkoutResultDetails = result;
                    return callback(null, result);
                });
            }
            else
            {
                checkoutDetails={
                    user:record.cardId,
                    vehicleId:record.vehicleId,
                    fromPort:record.fromPort,
                    checkOutTime:record.checkOutTime,
                    errorStatus:errorstatus,
                    errorMsg:errormsg
                };
                CheckOutError.create(checkoutDetails,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    checkoutResultDetails = result;
                    return callback(null,result);
                });
            }

        }/*,
        function (callback) {
            if(checkoutResultDetails.errorStatus==0)
            {
                kpiservice.kpistat(checkoutResultDetails.fromPort);
                return callback(null,null);
            }
            else
            {
                return callback(null,null);
            }
        }*/

    ],function (err,result) {
       if(err)
       {
           return callback(err,null);
       }
       return callback(null,checkoutResultDetails);
    });


};

exports.checkin=function (record,callback) {

    var userDetails=0;
    var vehiclesDetails;
    var dockingPortDetails=0;
    var checkInDetails;
    var checkOutDetails;
    var farePlanId;
    var checkinEntry;
    var errorstatus=0;
    var errormsg='';
    var duration;

    async.series([
       /* function (callback) {
        if (record.cardId) {
            User.findOne({'smartCardNumber': record.cardId}, function (err, result) {
                if (err) {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    return callback(err, null);
                }
                if (!result) {
                    errorstatus=1;
                    errormsg=errormsg+':'+Messages.USER_NOT_FOUND;
                    return callback(new Error(Messages.USER_NOT_FOUND));
                }
                userDetails = result;
                return callback(null, result);
            });
        }
        return callback();
        },*/
        /*function (callback) {
            vehicle.findOne({'vehicleRFID':record.vehicleId},function (err,result) {
                if (err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    return callback(err,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+Messages.VEHICLE_NOT_FOUND;
                    return callback(new Error(Messages.VEHICLE_NOT_FOUND));
                }
                /!*if(result.vehicleCurrentStatus==Constants.VehicleLocationStatus.WITH_PORT)
                {
                    return callback(new Error(Messages.VEHICLE_CHECKIN_NOT_CREATED));
                }*!/
                vehiclesDetails=result;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            Port.findOne({'_id':record.toPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    return callback(err,null);
                }
                if (!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+Messages.NO_PORT_FOUND;
                    return callback(new Error(Messages.NO_PORT_FOUND));
                }
                dockingPortDetails=result;
                return callback(null,result);
            });

        },*/
        function (callback) {
            CheckIn.findOne(record,function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    return callback(null,null);
                }
                if(!result)
                {
                    return callback(null,null);
                }
                errorstatus=1;
                errormsg=errormsg+': Duplicate record';
                return callback(null,null);
            });
        },
        function (callback) {
                if(errorstatus==0) {

                    CheckIn.create(record,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        checkInDetails=result;
                        return callback(null,result);
                    });
                }
                else
                {
                    checkinEntry = {
                        //user: record._id,
                        vehicleId: record.vehicleId,
                        toPort: record.toPort,
                        checkInTime: record.checkInTime,
                        errorStatus:errorstatus,
                        errorMsg:errormsg
                    };
                    CheckInError.create(checkinEntry,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        checkInDetails=result;
                        return callback(null,result);
                    });
                }
            /* }
             else {
             var checkinEntry = {
             vehicleId: vehiclesDetails._id,
             toPort: dockingPortDetails._id,
             checkInTime: record.checkInTime
             };
             }*/

        }/*,
        function (callback) {
            if(checkInDetails.errorStatus==0)
            {
                kpiservice.kpistat(checkInDetails.toPort);
                return callback(null,null);
            }
            else
            {
                return callback(null,null);
            }
        }*/
    ],function (err,result) {
        if(err)
        {
           return callback(err,null);
        }
        return callback(null,checkInDetails);
    });

};

exports.timelyCheckout = function (callback) {

    var vehiclesDetails;
    var userDetails;
    var vehicleLocationStatus;
    var checkoutResultDetails;
    var checkoutDetails;
    var fromPortDetails;
    var errorstatus=0;
    var errormsg='';

    async.series([
        function (callback) {
            CheckOut.find({'status':'Open','errorStatus':0,'updateStatus':0}).sort({'checkOutTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    checkoutDetails = result;
                    //console.log(result.vehicleId.currentAssociationId);
                }

                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(checkoutDetails.length>0)
            {
                async.forEach(checkoutDetails,function (checkoutDetail) {
                    vehicle.findById(checkoutDetail.vehicleId,function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            vehiclesDetails = result;
                            result.currentAssociationId = checkoutDetail.user;
                            result.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_MEMBER;
                            vehicle.findByIdAndUpdate(result._id,result,function (err) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                            });
                        }
                        else
                        {
                            return console.error("No vehicle found");
                        }
                    });
                    Port.findById(checkoutDetail.fromPort,function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            if(result._type=='Docking-port')
                            {
                                //if(result.vehicleId.length>0) {
                                result.vehicleId = [];
                                result.portStatus = Constants.AvailabilityStatus.EMPTY;
                                // }
                            }
                            else if(result._type=='Fleet')
                            {

                            }
                            else
                            {
                                if(result.vehicleId.length>0)
                                {
                                    result.portStatus = Constants.AvailabilityStatus.NORMAL;
                                    for(var i=0;i<result.vehicleId.length;i++)
                                    {
                                        if(result.vehicleId[i].vehicleid.equals(checkoutDetail.vehicleId))
                                        {
                                            result.vehicleId.splice(i,1);
                                            if(result.vehicleId.length==0)
                                            {
                                                result.portStatus = Constants.AvailabilityStatus.EMPTY;
                                            }
                                        }
                                    }
                                }
                            }
                            Port.findByIdAndUpdate(result._id,result,function (err) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                            });
                        }
                    });
                    User.findById(checkoutDetail.user,function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            Port.findById(checkoutDetail.fromPort,function (err,port) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                                if(port)
                                {
                                    Station.findById(port.StationId,function (err,stat) {
                                        if(err)
                                        {
                                            return console.error('Error : '+err);
                                        }
                                        if(stat)
                                        {
                                            var vehicleDetails = {
                                                vehicleid: checkoutDetail.vehicleId,
                                                vehicleUid: checkoutDetail.vehicleUid
                                            };
                                            result.vehicleId.push(vehicleDetails);
                                            //result.lastModifiedAt=new Date();
                                            DockStation.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                                if(err)
                                                {
                                                    return console.error('Error : '+err);
                                                }
                                                if(ds.length<=0)
                                                {
                                                    return callback(new Error("No docking station found to update for sync"));
                                                }
                                                result.unsuccessIp=[];
                                                for(var i=0;i<ds.length;i++)
                                                {
                                                    if(stat.ipAddress!=ds[i].ipAddress)
                                                    {
                                                        result.unsuccessIp.push(ds[i].ipAddress);
                                                    }
                                                }
                                                //result.unsuccessIp = ds;
                                                result.successIp=[];
                                                result.updateCount=0;
                                                User.findByIdAndUpdate(result._id,result,function (err) {
                                                    if (err)
                                                    {
                                                        return console.error('Error : '+err);
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }

                            });

                        }
                    });

                    CheckOut.findByIdAndUpdate(checkoutDetail._id,{$set:{'updateStatus':1}},function (err,result) {
                        if(err)
                        {
                            console.error('Error : '+err);
                        }
                        console.log('Checkout Success : '+result);
                        kpiservice.kpistat(result.fromPort,result.checkOutTime,2);
                    });

                },function (err) {
                    console.error('Error : '+err);
                    //callback();
                });
                return callback(null,null);
            }
            else
            {
                return callback(null,null);
            }
        }
        /*,

         function (callback) {
         if(checkoutDetails) {
         console.log(checkoutDetails.user._id);
         User.findById(checkoutDetails.user._id, function (err, result) {
         if (err) {
         return callback(err, null);
         }
         userDetails = result;
         return callback(null, result);
         });
         }
         else
         {
         return callback(null,null);
         }

         },
         function (callback) {
         Port.findById(vehiclesDetails.fromPort._id,function (err,result) {
         if(err)
         {
         errorstatus=1;
         return callback(err,null);
         }
         if(!result)
         {
         errorstatus=1;
         return callback(null,null);
         }
         //if(result.portType=='dock-port'){
         /!*    vehicleLocationStatus = Constants.VehicleLocationStatus.WITH_FLEET;
         }else {*!/
         vehicleLocationStatus = Constants.VehicleLocationStatus.WITH_PORT;
         //}

         return callback(null,result);
         });
         }
         ,*/
        /* function (callback) {
         if(vehicleLocationStatus==Constants.VehicleLocationStatus.WITH_FLEET || vehicleLocationStatus==Constants.VehicleLocationStatus.WITH_PORT)
         {

         checkoutDetails={
         member:userDetails._id,
         vehicleId:vehiclesDetails._id,
         fromPort:fromPortDetails._id,
         checkOutTime:record.checkOutTime
         };
         return callback(null,null);
         }
         else
         {
         return callback(new Error(Messages.CHECK_OUT_ENTRY_NOT_CREATED));
         }

         },*/

        /* function (callback) {
         if(checkoutDetails) {
         vehicle.findByIdAndUpdate(checkoutDetails.vehicleId._id, {
         $set: {
         'currentAssociationId': checkoutDetails.user._id,
         'vehicleCurrentStatus': Constants.VehicleLocationStatus.WITH_MEMBER
         }
         },{new:true}, function (err, result) {
         if (err) {
         return callback(err, null);
         }
         vehiclesDetails = result;
         return callback(null, result);
         });
         }
         else
         {
         return callback(null,null);
         }
         },

         function (callback) {
         if(vehiclesDetails) {


         //checkoutDetails.user.vehicleId.push(vehicleDetails);
         if(checkoutDetails.user._type=='member' && checkoutDetails.user.vehicleId.length<1) {
         User.findOne(checkoutDetails.user._id,function (err,result) {
         if(err)
         {
         console.log('Checkout User error');
         return callback(null,null);
         }
         var vehicledetail = {
         vehicleid: checkoutDetails.vehicleId._id,
         vehicleUid: checkoutDetails.vehicleId.vehicleUid
         };
         result.vehicleId.push(vehicledetail);
         User.findByIdAndUpdate(checkoutDetails.user._id, result, function (err, result) {
         if (err) {
         return callback(err, null);
         }
         userDetails = result;
         });
         return callback(null, result);
         });


         }
         }
         else {
         return callback(null,null);
         }
         }, function (callback) {
         if(userDetails) {
         Port.findOne(checkoutDetails.fromPort._id,function (err,result) {
         if(err)
         {
         return callback(null,null);
         }

         if(result._type=='Docking-port')
         {
         if(result.vehicleId.length>0) {
         result.vehicleId = [];
         result.portStatus = Constants.AvailabilityStatus.EMPTY;
         }
         }
         else if(checkoutDetails.fromPort._type=='Fleet')
         {

         }
         else
         {
         if(result.vehicleId.length>0)
         {
         for(var i=0;i<result.vehicleId.length;i++)
         {
         if(result.vehicleId[i].vehicleid.equals(checkoutDetails.vehicleId._id))
         {
         result.vehicleId.splice(i,1);
         }
         }
         }

         }

         Port.findByIdAndUpdate(result._id,result,function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         // return callback(null,result);
         });
         return callback(null,result);
         });
         }
         else
         {
         return callback(null,null);
         }
         }*/
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,null);
    });

};

exports.timelyCheckin = function (callback) {
    var checkinDetails;
    var userDetails;
    var vehiclesDetails;
    var dockingPortDetails;
    var checkInDetails;
    var errorstatus=0;
    var errormsg='';
    async.series([
        function (callback) {
            CheckIn.find({'status':'Open','errorStatus':0,'updateStatus':0}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    checkinDetails = result;
                    //console.log(result.vehicleId.currentAssociationId);
                }

                return callback(null,result);
            });
        },
        /* function (callback) {
         if(checkinDetails.length>0)
         {
         async.forEach(checkinDetails,function (checkinDetail) {
         DockPort.find({'portStatus':Constants.AvailabilityStatus.FULL},function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         if(!result)
         {
         return callback(null,null);
         }
         for(var i=0;i<result.length;i++)
         {
         if(!result[i]._id.equals(checkinDetail.fromPort))
         {
         if(checkinDetail.vehicleId.equals(result[i].vehicleId[0].vehicleid))
         {
         result[i].vehicleId=[];
         result[i].portStatus=Constants.AvailabilityStatus.EMPTY;
         DockPort.findByIdAndUpdate(result[i]._id,result[i],{new:true},function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         });
         }
         }
         }
         });

         },function (err) {
         console.error('Error : '+err);
         //callback();
         });
         return callback(null,null);
         }
         else
         {
         return callback(null,null);
         }
         }
         ,*/
        function (callback) {
            if(checkinDetails.length>0)
            {
                async.forEach(checkinDetails,function (checkinDetail) {
                    /*                    async.series([
                     function (callback) {

                     }
                     ],function (err,result) {
                     if(err)
                     {
                     return callback(err,null);
                     }
                     return callback(null,result);
                     });*/
                    vehicle.findById(checkinDetail.vehicleId,function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            vehiclesDetails = result;
                            if(result.vehicleCurrentStatus == Constants.VehicleLocationStatus.WITH_MEMBER)
                            {
                                User.findById(result.currentAssociationId, function (err, result) {
                                    if (err) {
                                        return console.error('Checkin Time User Error : ' + err);
                                    }
                                    if (result) {
                                        userDetails = result;
                                        if (result._type == 'member') {
                                            //if(result.vehicleId.length>0) {
                                            result.vehicleId = [];
                                            // }
                                        }
                                        else {
                                            if (result.vehicleId.length > 0) {
                                                for (var i = 0; i < result.vehicleId.length; i++) {
                                                    if (result.vehicleId[i].vehicleid.equals(checkinDetail.vehicleId)) {
                                                        result.vehicleId.splice(i, 1);
                                                    }
                                                }
                                            }

                                        }
                                        Port.findById(checkinDetail.toPort,function (err,port) {
                                            if (err) {
                                                return console.error('Error : ' + err);
                                            }
                                            if(port)
                                            {
                                                Station.findById(port.StationId,function (err,stat) {
                                                    if (err) {
                                                        return console.error('Error : ' + err);
                                                    }
                                                    if(stat)
                                                    {
                                                        DockStation.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                                            if(err)
                                                            {
                                                                return console.error('Error : '+err);
                                                            }
                                                            if(ds.length<=0)
                                                            {
                                                                return callback(new Error("No docking station found to update for sync"));
                                                            }
                                                            //result.lastModifiedAt=new Date();
                                                            result.unsuccessIp=[];
                                                            for(var i=0;i<ds.length;i++)
                                                            {
                                                                if(stat.ipAddress!=ds[i].ipAddress)
                                                                {
                                                                    result.unsuccessIp.push(ds[i].ipAddress);
                                                                }
                                                            }
                                                            //result.unsuccessIp = ds;
                                                            result.successIp=[];
                                                            result.updateCount=0;
                                                            User.findByIdAndUpdate(result._id,result,function (err) {
                                                                if (err)
                                                                {
                                                                    return console.error('Error : '+err);
                                                                }
                                                            });
                                                        });
                                                    }
                                                    else
                                                    {
                                                        return console.error('Error : station not found inside checkin');
                                                    }
                                                });
                                            }
                                        });

                                    }
                                    else
                                    {
                                        return console.error('Checkin Time User Error');
                                    }
                                });
                            }
                            result.currentAssociationId = checkinDetail.toPort;
                            result.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_PORT;
                            vehicle.findByIdAndUpdate(result._id,result,function (err) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                            });
                        }
                    });
                    Port.findById(checkinDetail.toPort,function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            var vehicleDetails = {
                                vehicleid: checkinDetail.vehicleId
                            };

                            if(result._type=='Docking-port')
                            {
                                //if(result.vehicleId.length>0) {
                                result.vehicleId=[];
                                result.portStatus = Constants.AvailabilityStatus.FULL;
                                result.vehicleId.push(vehicleDetails);
                                // }
                            }
                            else
                            {
                                result.vehicleId.push(vehicleDetails);
                                if(result.vehicleId.length>=result.portCapacity)
                                {
                                    result.portStatus = Constants.AvailabilityStatus.FULL;
                                }
                                else
                                {
                                    result.portStatus = Constants.AvailabilityStatus.NORMAL;
                                }
                            }
                            //result.portStatus = Constants.AvailabilityStatus.FULL;


                            Port.findByIdAndUpdate(result._id,result,{new:true},function (err,portUpdated) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                                DockPort.find({'portStatus':Constants.AvailabilityStatus.FULL},function (err,result) {
                                    if(err)
                                    {
                                        return console.error('Error : '+err);
                                    }
                                    if(!result)
                                    {
                                        return console.log('No port found');
                                    }
                                    for(var i=0;i<result.length;i++)
                                    {
                                        if(!result[i]._id.equals(portUpdated._id))
                                        {
                                            if(result[i].vehicleId[0].vehicleid)
                                            {
                                                if(checkinDetail.vehicleId.equals(result[i].vehicleId[0].vehicleid))
                                                {
                                                    /*result[i].vehicleId=[];
                                                     result[i].portStatus=Constants.AvailabilityStatus.EMPTY;*/
                                                    DockPort.findByIdAndUpdate(result[i]._id,{$set:{'vehicleId':[],'portStatus':Constants.AvailabilityStatus.EMPTY}},function (err) {
                                                        if(err)
                                                        {
                                                            return console.error('Error : '+err);
                                                        }
                                                    });
                                                }
                                            }

                                        }
                                    }
                                });
                            });
                        }
                    });

                    CheckIn.findByIdAndUpdate(checkinDetail._id,{$set:{'updateStatus':1}},function (err,result) {
                        if(err)
                        {
                            console.error('Error : '+err);
                        }
                        console.log('Checkin Success : '+result);
                        kpiservice.kpistat(result.toPort,result.checkInTime,1);
                    });
                    /* if(vehiclesDetails) {

                     if (vehiclesDetails.vehicleCurrentStatus == Constants.VehicleLocationStatus.WITH_MEMBER) {*/

                    /*                        }
                     }*/
                    if(userDetails)
                    {
                        CheckIn.findByIdAndUpdate(checkinDetail._id,{$set:{'user':userDetails._id}},function (err,result) {
                            if(err)
                            {
                                console.error('Error : '+err);
                            }
                            console.log('Checkin Success : '+result);
                        });
                    }

                },function (err) {
                    console.error('Error : '+err);

                    //callback();
                });
                return callback(null,null);
            }
            else
            {
                return callback(null,null);
            }
        }
        /*       function (callback) {
         if(checkinData) {
         console.log(checkinData.vehicleId.currentAssociationId);
         User.findById(checkinData.vehicleId.currentAssociationId, function (err, result) {
         if (err) {
         return callback(err, null);
         }
         userDetails = result;
         return callback(null, result);
         });
         }
         else
         {
         return callback(null,null);
         }
         },
         function (callback) {
         if(checkinData) {
         Port.findOne({'_id':checkinData.toPort._id},function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         if(result) {
         dockingPortDetails = result;
         }
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
         if(userDetails)
         {
         CheckIn.findByIdAndUpdate(checkinData._id,{$set:{'user':userDetails._id}},{new: true},function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         checkInDetails=result;
         return callback(null,result);
         });
         }else {
         return callback(null,null);
         }
         }
         ,
         function (callback) {
         if(userDetails) {
         vehicle.findByIdAndUpdate(checkinData.vehicleId._id, {
         $set: {
         'currentAssociationId': dockingPortDetails._id,
         'vehicleCurrentStatus': Constants.VehicleLocationStatus.WITH_PORT
         }
         }, function (err, result) {
         if (err) {
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
         /!* function (callback) {
         Port.findOne({'_id':checkinData.toPort._id},function (err,result) {
         if (err)
         {
         return callback(err,null);
         }
         dockingPortDetails=result;
         return callback(null,result);
         });
         }
         ,*!/

         function (callback) {
         if(userDetails) {
         userDetails.vehicleId = [];
         User.findByIdAndUpdate(userDetails._id, userDetails,{new:true}, function (err, result) {
         if (err) {
         return callback(err, null);
         }
         userDetails = result;
         return callback(null, result);
         });
         }
         else
         {
         return callback(null,null);
         }
         },
         function (callback) {
         if(checkinData) {
         if(dockingPortDetails.portStatus!=1) {

         var vehicleDetails = {
         vehicleid: checkinData.vehicleId._id,
         vehicleUid: checkinData.vehicleId.vehicleUid

         };
         dockingPortDetails.vehicleId.push(vehicleDetails);
         dockingPortDetails.portStatus = Constants.AvailabilityStatus.FULL;
         Port.findByIdAndUpdate(dockingPortDetails._id, dockingPortDetails, {new: true}, function (err, result) {
         if (err) {
         return callback(err, null);
         }
         return callback(null, result);
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
         if(checkInDetails) {
         TransactionReconciliation.ReconcileTransaction(checkInDetails, function (err, result) {
         if (err) {
         return callback(err, null);
         }
         checkInDetails = result;
         return callback(null, result);
         });
         }
         else
         {
         return callback(null,null);
         }
         }
         */
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    })
};

exports.getAllCompletedTransactions = function (record,callback) {
    var alltrans = [];
    var queryObject;
    var fdate,ldate;
    async.series([
        function (callback) {
            if(record.fromdate && record.todate)
             {
                 fdate = moment(record.fromdate);
                fdate=fdate.format('YYYY-MM-DD');
                 ldate = moment(record.todate).add(1, 'days');
                 ldate=ldate.format('YYYY-MM-DD');
                 queryObject = {
                     checkOutTime: {$gte: moment(fdate), $lte: moment(ldate)}
                 };
                 return callback(null,null);
             }
            else
            {
                 fdate = moment().subtract(15,'days');
                fdate=fdate.format('YYYY-MM-DD');
                 ldate = moment().add(1, 'days');
                ldate=ldate.format('YYYY-MM-DD');
                queryObject = {
                    checkOutTime: {$gte: moment(fdate), $lte: moment(ldate)}
                };
                return callback(null,null);
            }

        },
        function (callback) {
            if (record.user) {
                User.findOne({cardNum: record.user}, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    if(result)
                    {
                        queryObject.user = result._id;
                        return callback(null, result);
                    }
                    else
                    {
                        return callback(new Error(Messages.USER_NOT_FOUND),null);
                    }
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function(callback){
            if(record.vehicle)
            {
                vehicle.findOne({vehicleNumber:record.vehicle},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(result)
                    {
                        queryObject.vehicle = result._id;
                        return callback(null,result);
                    }
                    else
                    {
                        return callback(new Error(Messages.VEHICLE_NOT_FOUND),null);
                    }
                });
            }
            else {
                return callback(null, null);
            }

        }
        ,
        function (callback) {
            queryObject.duration = {$lt:240};


             MemberTransaction.distinct("checkOutTime",queryObject).deepPopulate('user vehicle fromPort toPort').lean().exec(function (err,result) {
           // MemberTransaction.find(queryObject).sort({'createdAt': -1}).deepPopulate('user vehicle fromPort toPort').lean().exec(function (err,result) {
                 if (err) {
                     return callback(err, null);
                 }
                 if (result.length > 0) {

                     for (var i = 0; i < result.length; i++) {
                         if (result[i].user) {
                             if (result[i].user._type == 'member' && (result[i].fromPort._type == 'Docking-port' || result[i].fromPort._type == 'Redistribution-area' || result[i].fromPort._type == 'Holding-area') && (result[i].toPort._type == 'Docking-port' || result[i].toPort._type == 'Redistribution-area' || result[i].toPort._type == 'Holding-area')) {
                                 alltrans.push(result[i]);
                             }
                         }
                     }
                     return callback(null, result);
                 }
                 else {
                     return callback(new Error(Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE), null);
                 }

             });

           // MemberTransaction.find(queryObject).sort({'createdAt': -1}).deepPopulate('user vehicle fromPort toPort').lean().exec(function (err,result) {
           /* MemberTransaction.find(queryObject).sort({'createdAt': -1}).deepPopulate('user vehicle fromPort toPort').lean().exec(function (err,result) {

                if(err)
                {
                    return callback(err,null);
                }
                if(result.length>0)
                {

                    for(var i=0;i<result.length;i++)
                    {
                        if(result[i].user)
                        {
                            if(result[i].user._type=='member' && (result[i].fromPort._type=='Docking-port' || result[i].fromPort._type=='Redistribution-area' || result[i].fromPort._type=='Holding-area') && (result[i].toPort._type=='Docking-port' || result[i].toPort._type=='Redistribution-area'|| result[i].toPort._type=='Holding-area')) {
                                alltrans.push(result[i]);
                            }
                        }
                    }
                    return callback(null,result);
                }
                else
                {
                    return callback(new Error(Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE),null);
                }

            });*/
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,alltrans);
    });

};

exports.clearOpenCheckout = function (id,callback) {
    async.waterfall([
        function (callback) {
            CheckOut.findById(id,function (err,checkoutDetail) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!checkoutDetail)
                {
                    return callback(new Error('Checkout not found for this id'),null);
                }
                return callback(null,checkoutDetail);
            });
        },
        function (checkoutDetail,callback) {
            User.findById(checkoutDetail.user,function (err,userDetail) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!userDetail)
                {
                    return callback(null,"No user");
                }
                if(userDetail._type=='member')
                {
                    userDetail.vehicleId=[];
                }
                else 
                {
                    for(var i=0;i<userDetail.vehicleId.length;i++)
                    {
                        if(userDetail.vehicleId.vehicleid.equals(checkoutDetail.vehicleId))
                        {
                            userDetail.vehicleId.splice(i,1);
                        }
                    }
                }
                userDetail.lastModifiedAt = new Date();
                User.findByIdAndUpdate(userDetail._id,userDetail,{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
                
            }); 
        },
        function (result,callback) {
            CheckOut.findByIdAndRemove(id,function (err,result) {
                if(err)
                {
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
        return callback(null,'Checkout cleared');
    });
};

exports.getAllcheckins = function (callback) {
    CheckIn.find({'status':'Open'}).sort({'createdAt': -1}).deepPopulate('user vehicleId toPort').lean().exec(function (err,result) {
        if (err) {
            return callback(err, null);
        }
        return callback(null,result);
    });
};

exports.clearOpenCheckin = function (id,callback) {
    CheckIn.findByIdAndRemove(id,function (err,checkinDetail) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,checkinDetail);
    });
};

exports.clearAllOpenCheckout = function (callback) {
    var checkout;
    var users = [];
    async.series([
        function (callback) {
            CheckOut.find({status:"Open"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("No open checkouts found"));
                }
                checkout = result;
                for(var i=0;i<checkout.length;i++)
                {
                    users.push(checkout[i].user);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(users.length>0)
            {
               for(var i=0;i<users.length;i++)
               {
                   User.update({_id:users[i]},{$set:{vehicleId:[]}}).exec();
                   if(i==users.length-1)
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
            if(checkout.length>0) {
                for (var i = 0; i < checkout.length; i++) {
                    CheckOut.findByIdAndRemove(checkout[i]._id).exec();
                    if (i == checkout.length - 1) {
                        return callback(null, null);
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
    });

};

exports.clearAllOpenCheckin = function (callback) {
    CheckIn.remove({status:"Open"},function (err,checkinDetail) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,checkinDetail);
    });
};

exports.clearDuplicate = function (record,callback) {
    async.forEach(record.IDS, function (item, callback2) {
      MemberTransaction.findByIdAndRemove(item).exec().then(function (err) {
          callback2();
      });
    });
    return callback(null,"Transactions removing");
};

exports.getOpenCheckouts = function (id,callback) {
    User.findOne({cardNum:id},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(!result)
        {
            return callback(new Error("No user found by this id"),null);
        }
        CheckOut.find({status:"Open",user:result._id}).deepPopulate('user vehicleId fromPort').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            if(!result)
            {
                return callback(new Error("No open checkouts found"));
            }
            return callback(null,result);
        });
    });
};

exports.clearOpenCheckoutFromControlCenter = function (record,callback) {
    var user;
    var vehicleDet;
    var port;
    var checkout;
    async.series([
        function (callback) {
            User.findOne({UserID:record.user},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("No user found"),null);
                }
                user = result;
                return callback(null,result);
            });
        },
        function (callback) {
            vehicle.findOne({vehicleUid:record.vehicle},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("No vehicle found"),null);
                }
                vehicleDet = result;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({PortID:record.port},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("Port not found"),null);
                }
                port = result;
                return callback(null,result);
            });
        },
        function (callback) {
            CheckOut.findOne({user:user._id, vehicleId:vehicleDet._id, fromPort:port._id,checkOutTime:record.checkouttime, status:"Open"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("No matching checkout found"),null);
                }
                checkout = result;
                return callback(null,result);
            });
        },
        function (callback) {
            CheckOut.findByIdAndRemove(checkout._id,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(user._type == "member")
            {
                User.findByIdAndUpdate(user._id,{$set:{vehicleId:[]}},{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            }
            else
            {
                for(var i=0;i<user.vehicleId;i++)
                {
                    if(vehicleDet._id.equals(user.vehicleId[i].vehicleid))
                    {
                        user.vehicleId.splice(i,1);
                    }
                }
                User.findByIdAndUpdate(user._id,{$set:{vehicleId:user.vehicleId}},{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            }
        }

    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};