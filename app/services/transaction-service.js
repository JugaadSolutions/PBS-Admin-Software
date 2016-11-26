/**
 * Created by root on 3/10/16.
 */
var async = require('async'),
    moment = require('moment'),
    CheckOut=require('../models/checkout'),
    CheckIn=require('../models/checkin'),
    vehicle = require('../models/vehicle'),
    User = require('../models/user'),
    Member = require('../models/member'),
    DockPort=require('../models/dock-port'),
    Port = require('../models/port'),
MemberTransaction = require('../models/transaction');
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
            CheckOut.find({'status':'Open'}).deepPopulate('user vehicleId fromPort').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        if(result[i].user._type=='member' && (result[i].fromPort._type=='Docking-port' || result[i].fromPort._type=='Redistribution-area'))
                        {

                        }
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
                        details.user=result[i].user;
                        details.vehicle=result[i].vehicleId;
                        details.fromPort=result[i].fromPort;
                        details.checkOutTime=result[i].checkOutTime;
                        details.status=result[i].status;
                        alltrans.push(details);

                    }
                }
                return callback(null,result);
            });
        },
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
                        alltrans.push(result[i]);
                    }
                }
                return callback(null,result);
            });

        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,alltrans);
    });

};

exports.getFewRecordsWRTMember = function (id, callback) {
    MemberTransaction.find({'user': id}).sort({'createdAt': -1}).deepPopulate('fromPort toPort').lean().exec(function (err, res) {

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
        function (callback) {
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

        },
        function (callback) {
            Member.findById(vehiclesDetails.currentAssociationId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(null,null);
                }
                errorstatus=1;
                errormsg=errormsg+':'+'vehicle is with the member';
                vehicleLocationStatus = Constants.VehicleLocationStatus.WITH_MEMBER;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(errorstatus==0) {
                checkoutDetails={
                    user:userDetails._id,
                    vehicleId:vehiclesDetails._id,
                    fromPort:fromPortDetails._id,
                    checkOutTime:record.checkOutTime
                };
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
            }
            CheckOut.create(checkoutDetails, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                checkoutResultDetails = result;
                return callback(null, result);
            });
        }
        ,
        function (callback) {
            Port.findById(vehiclesDetails.currentAssociationId,function (err,result) {
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
                /*    vehicleLocationStatus = Constants.VehicleLocationStatus.WITH_FLEET;
                }else {*/
                    vehicleLocationStatus = Constants.VehicleLocationStatus.WITH_PORT;
                //}

                return callback(null,result);
            });
        }
        ,
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

        function (callback) {
            if(errorstatus==0) {
                vehicle.findByIdAndUpdate(vehiclesDetails._id, {
                    $set: {
                        'currentAssociationId': userDetails._id,
                        'vehicleCurrentStatus': Constants.VehicleLocationStatus.WITH_MEMBER
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

        function (callback) {
            if(errorstatus==0) {
                var vehicleDetails = {
                    vehicleid: vehiclesDetails._id,
                    vehicleUid: vehiclesDetails.vehicleUid

                };
                userDetails.vehicleId.push(vehicleDetails);
                Member.findByIdAndUpdate(userDetails._id,userDetails,{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    userDetails=result;
                    return callback(null,result);
                });
            }
            else {
                return callback(null,null);
            }
        }, function (callback) {
            if(errorstatus==0) {
            fromPortDetails.vehicleId=[];
            fromPortDetails.portStatus=Constants.AvailabilityStatus.EMPTY;
            Port.findByIdAndUpdate(fromPortDetails._id,fromPortDetails,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
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
                /*if(result.vehicleCurrentStatus==Constants.VehicleLocationStatus.WITH_PORT)
                {
                    return callback(new Error(Messages.VEHICLE_CHECKIN_NOT_CREATED));
                }*/
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

        },
        function (callback) {
                if(errorstatus==0) {
                    if(userDetails!=0) {
                        checkinEntry = {
                            user: userDetails._id,
                            vehicleId: vehiclesDetails._id,
                            toPort: dockingPortDetails._id,
                            checkInTime: record.checkInTime

                        };
                    }
                    else
                    {
                        checkinEntry = {

                            vehicleId: vehiclesDetails._id,
                            toPort: dockingPortDetails._id,
                            checkInTime: record.checkInTime

                        };
                    }
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
                }
            /* }
             else {
             var checkinEntry = {
             vehicleId: vehiclesDetails._id,
             toPort: dockingPortDetails._id,
             checkInTime: record.checkInTime
             };
             }*/
            CheckIn.create(checkinEntry,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                checkInDetails=result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
           return callback(err,null);
        }
        return callback(null,checkInDetails);
    });

};

exports.timelyCheckin = function (callback) {
    var checkinData;
    var userDetails=0;
    var vehiclesDetails;
    var dockingPortDetails=0;
    var checkInDetails;
    var errorstatus=0;
    var errormsg='';
    async.series([
        function (callback) {
            CheckIn.findOne({'status':'Open'}).deepPopulate('vehicleId toPort').sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    checkinData = result;
                    console.log(result.vehicleId.currentAssociationId);
                }

                return callback(null,result);
            });
        },
        function (callback) {
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
            if(userDetails!=0)
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
            if(checkInDetails) {
                vehicle.findByIdAndUpdate(checkinData.vehicleId._id, {
                    $set: {
                        'currentAssociationId': checkinData.toPort._id,
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
           /* function (callback) {
                Port.findOne({'_id':checkinData.toPort._id},function (err,result) {
                    if (err)
                    {
                        return callback(err,null);
                    }
                    dockingPortDetails=result;
                    return callback(null,result);
                });
            }
        ,*/

        function (callback) {
            if(userDetails) {
                userDetails.vehicleId = [];
                User.findByIdAndUpdate(userDetails._id, userDetails, {new: true}, function (err, result) {
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
                var vehicleDetails = {
                    vehicleid: checkinData.vehicleId._id,
                    vehicleUid: checkinData.vehicleId.vehicleUid

                };
                dockingPortDetails.vehicleId.push(vehicleDetails);
                dockingPortDetails.portStatus = Constants.AvailabilityStatus.FULL;
                Port.findByIdAndUpdate(dockingPortDetails._id, dockingPortDetails,{new:true}, function (err, result) {
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

    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    })
};