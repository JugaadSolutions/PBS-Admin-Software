var async = require('async'),
    moment = require('moment'),
    CheckOut=require('../models/checkout'),
    CheckIn=require('../models/checkin'),
    vehicle = require('../models/vehicle'),
    User = require('../models/user'),
    Member = require('../models/member'),
    DockPort=require('../models/dock-port'),
    DockStation = require('../models/dock-station'),
    Messages = require('../core/messages'),
    Port = require('../models/port'),
    Card = require('../models/card'),
    Membership = require('../models/membership');
var fleet = require('../models/fleet');
var RequestService = require('../services/request-service');
var TransactionAssociation = require('../models/transaction-association'),
    Constants = require('../core/constants'),
    FarePlanService = require('../services/fare-plan-service'),
    Transaction = require('../models/transaction');


exports.ReconcileTransaction=function () {
    var checkinDetails;
    var balance;
    var comments = '-';
    async.series([
        function (callback) {
            CheckIn.find({'status':'Open','errorStatus':0,'updateStatus':1}).sort({'checkInTime': 'ascending'}).deepPopulate('toPort vehicleId').exec(function (err,result) {
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
        function (callback) {
            if(checkinDetails.length>0)
            {
                async.forEach(checkinDetails,function (checkinDetail) {
                    CheckOut.findOne({
                        vehicleId: checkinDetail.vehicleId,
                        status: 'Open',
                        updateStatus:1,
                        checkOutTime: {$lt:moment(checkinDetail.checkInTime)}
                    }).sort({checkOutTime: -1}).deepPopulate('user vehicleId fromPort ').exec(function (err, result) {
                        if (err) {
                            return console.error('Error : '+err);
                        }
                        if(result) {
                            User.findById(result.user._id).deepPopulate('membershipId').lean().exec(function (err,userdetails) {
                                if(err)
                                {
                                    return console.error('Reconciliation User Error : '+err);
                                }
                                if(!userdetails)
                                {
                                    return console.log('User id not found : '+result.user);
                                }
                                if(userdetails._type=='member'&& (userdetails.status==Constants.MemberStatus.REGISTERED))
                                {
                                    var checkInTime = moment(checkinDetail.checkInTime);
                                    var checkOutTime = moment(result.checkOutTime);

                                    var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                                    var duration = durationMin.asMinutes();

                                    Membership.findById(userdetails.membershipId,function (err,membership) {
                                        if(err)
                                        {
                                            return console.error('Reconciliation Membership Error : '+err);
                                        }
                                        if(!membership)
                                        {
                                            return console.error('Reconciliation Membership Error : Could not able to find membership plan');
                                        }
                                        FarePlanService.calculateFarePlan(membership.farePlan, duration, function (err, creditUsed) {

                                            if (err) {
                                                return console.log('Error Fare plan calculation'+err);
                                            }
                                            /*if (!creditUsed) {
                                                return console.log('Error Fare plan calculation'+err);
                                            }*/
                                            balance = Number(userdetails.creditBalance) - creditUsed;
                                            /*if(balance<0)
                                             {
                                             userdetails.comments = 'Your balance was :'+balance+' on '+moment().format('DD-MM-YYYY')+'. Negative balance recovered from security deposit on the last bicycle checkin';
                                             userdetails.securityDeposit=userdetails.securityDeposit+balance;
                                             balance = 0;
                                             }*/
                                            Member.findById(result.user,function (err,memDetails) {
                                                if(err)
                                                {
                                                    return console.log('Error finding member '+err);
                                                }
                                                if(!result)
                                                {
                                                    return console.log('Error finding member to update balance after checkin');
                                                }
                                                memDetails.creditBalance = balance;
                                                memDetails.vehicleId = [];
                                                Member.update({_id:memDetails._id},memDetails, {new: true}).lean().exec(function (err, updatedUser) {
                                                    if (err) {
                                                        return console.error('Error updating Member at reconcilation'+err);
                                                    }
                                                    /*Card.findByIdAndUpdate(memDetails.smartCardId,{$set:{balance:memDetails.creditBalance}},function (err) {
                                                     if (err) {
                                                     return console.error('Error updating card at reconcilation'+err);
                                                     }
                                                     });*/
                                                    var transactionAssoc = {
                                                        checkInEntry: checkinDetail._id,
                                                        checkOutEntry: result._id
                                                    };

                                                    TransactionAssociation.create(transactionAssoc, function (err) {
                                                        if (err) {
                                                            return console.error('Error creating transaction association at reconcilation'+err);
                                                        }
                                                        CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close'}}, function (err) {
                                                            if (err) {
                                                                return console.error('Error updating checkin entry to Close status '+err);
                                                            }
                                                        });
                                                        CheckOut.findByIdAndUpdate(result._id, {$set: {'status': 'Close'}}, function (err) {
                                                            if (err) {
                                                                return console.error('Error updating checkout entry to Close status'+err);
                                                            }
                                                        });
                                                        var transaction = {
                                                            user: result.user._id,
                                                            vehicle: result.vehicleId._id,
                                                            fromPort: result.fromPort._id,
                                                            toPort: checkinDetail.toPort._id,
                                                            checkOutTime: result.checkOutTime,
                                                            checkInTime: checkinDetail.checkInTime,
                                                            duration: duration,
                                                            creditsUsed: creditUsed,
                                                            creditBalance: balance,
                                                            uid:result.user.UserID,
                                                            vid:result.vehicleId.vehicleUid,
                                                            fportid:result.fromPort.PortID,
                                                            tportid:checkinDetail.toPort.PortID,
                                                            status: 'Close'
                                                        };
                                                        Transaction.create(transaction, function (err) {
                                                            if (err) {
                                                                return console.error('Error '+err);
                                                            }
                                                        });
                                                    });

                                                });
                                            });
                                            //creditUsed = result;
                                            //return callback(null, result);
                                        });
                                    });
                                }
                                else
                                {
                                    if (userdetails.vehicleId.length > 0) {
                                        for (var i = 0; i < userdetails.vehicleId.length; i++) {
                                            if (userdetails.vehicleId[i].vehicleid.equals(checkinDetail.vehicleId)) {
                                                userdetails.vehicleId.splice(i, 1);
                                            }
                                            if(i==userdetails.vehicleId.length-1)
                                            {
                                                User.findByIdAndUpdate(userdetails._id,userdetails,function (err) {
                                                    if(err)
                                                    {
                                                        return console.error('Error '+err);
                                                    }
                                                });
                                            }
                                        }
                                    }

                                    var checkInTime = moment(checkinDetail.checkInTime);
                                    var checkOutTime = moment(result.checkOutTime);

                                    var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                                    var duration = durationMin.asMinutes();

                                    /*User.*/
                                    var transactionAssoc = {
                                        checkInEntry: checkinDetail._id,
                                        checkOutEntry: result._id
                                    };
                                    TransactionAssociation.create(transactionAssoc, function (err) {
                                        if (err) {
                                            return console.error('Error '+err);
                                        }
                                        CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close'}}, {new: true}, function (err) {
                                            if (err) {
                                                return console.error('Error '+err);
                                            }
                                        });
                                        CheckOut.findByIdAndUpdate(result._id, {$set: {'status': 'Close'}}, {new: true}, function (err) {
                                            if (err) {
                                                return console.error('Error '+err);
                                            }
                                        });
                                        var transaction = {
                                            user: result.user,
                                            vehicle: result.vehicleId,
                                            fromPort: result.fromPort,
                                            toPort: checkinDetail.toPort,
                                            checkOutTime: result.checkOutTime,
                                            checkInTime: checkinDetail.checkInTime,
                                            duration: duration,
                                            creditsUsed: 0,
                                            creditBalance: 0,
                                            status: 'Close'
                                        };
                                        Transaction.create(transaction, function (err) {
                                            if (err) {
                                                return console.error('Error '+err);
                                            }
                                        });
                                    });

                                }
                            });
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
    ],function (err,result) {
        if(err)
        {
            return console.log(err);
        }
/*        if(result[0].length>0)
        {
            return console.log(result);
        }*/

    });
};


exports.syncTransaction = function () {

    async.waterfall([
        function(callback)
        {
            Transaction.find({synced:false}).deepPopulate('user vehicle fromPort toPort').lean().exec(function (err,trans) {
                if(err)
                {
                    return callback(err,null);
                }
                if(trans.length>0)
                {
                    return callback(null,trans);
                }
                else
                {
                    return callback(null,null);
                }

            });
        },
        function (trans,callback) {
            if(trans)
            {
                for(var i=0;i<trans.length;i++)
                {
                    var httpMethod = 'POST',
                        uri = 'transactions/reconsiled',
                        requestBody = {

                            "user": trans[i].user.UserID,
                            "vehicle": trans[i].vehicle.vehicleUid,
                            "fromPort": trans[i].fromPort.PortID,
                            "toPort":trans[i].toPort.PortID,
                            "checkOutTime":trans[i].checkOutTime,
                            "checkInTime":trans[i].checkInTime,
                            "duration":trans[i].duration,
                            "creditsUsed":trans[i].creditsUsed,
                            "creditBalance":trans[i].creditBalance,
                            "status":trans[i].status
                        };

                    RequestService.sdcRequestHandler(httpMethod, uri, requestBody,function (err,result) {
                        if(err)
                        {
                            console.log('Checkout Connection Error');
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("Unable to Update Data"),null);
                        }
                        Transaction.findOneAndUpdate({user:result.user,vehicle:result.vehicle,fromPort:result.fromPort,toPort:result.toPort,
                            checkOutTime:result.checkOutTime,checkInTime:result.checkInTime,duration:result.duration,creditsUsed:result.creditsUsed,
                            creditBalance:result.creditBalance,status:result.status},
                            {$set:{synced:true}},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                        });
                    });
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
            return console.log(err);
        }
        return ;
    })
};