var async = require('async'),
    moment = require('moment'),
    CheckOut=require('../models/checkout'),
    CheckIn=require('../models/checkin'),
    vehicle = require('../models/vehicle'),
    User = require('../models/user'),
    Member = require('../models/member'),
    DockPort=require('../models/dock-port'),
    Messages = require('../core/messages'),
    Port = require('../models/port');
    Membership = require('../models/membership');
var fleet = require('../models/fleet');

var TransactionAssociation = require('../models/transaction-association'),
    Constants = require('../core/constants'),
    FarePlanService = require('../services/fare-plan-service'),
    Transaction = require('../models/transaction');


/*exports.ReconcileTransaction=function (record,callback) {

    var userDetails=0;
    var memberObject;
    var vehiclesDetails;
    var dockingPortDetails;
    var checkInDetails;
    var checkOutDetails=0;
    var ismember=true;
    var farePlanId;
    var creditUsed;
    var checkinEntry;
    var errorstatus=0;
    var errormsg='';
    var duration;
    var transAssociation=0;
    var balance;

    async.series([
        function (callback) {
            User.findOne({'_id':record.user},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result._type!='member')
                {
                    ismember=false;
                }
                userDetails=result;
                return callback(null,result);
            });
        },

        function (callback) {
          if(ismember)
          {
              Member.findOne({'_id': userDetails._id}).populate('membershipId').lean().exec(function (err, result) {

                  if (err) {
                      return callback(err, null);
                  }

                  if (!result) {
                      return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                  }

                  memberObject = result;
                  farePlanId = result.membershipId.farePlan;
                  return callback(null, result);

              });
          }
          else
          {
              return callback(null,null);
          }
          //return callback(null,null);
        },
        /!*function (callback) {
            vehicle.findById(record.vehicleId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                vehiclesDetails=result;
                return callback(null,result);
            });
        },*!/

 /!*function (callback) {

        /!* if (vehiclesDetails.vehicleCurrentStatus == Constants.VehicleLocationStatus.WITH_MEMBER) {*!/
             Member.findOne({record.: vehiclesDetails.currentAssociationId}).populate('membershipId').lean().exec(function (err, result) {
                 if (err) {
                     return callback(err, null);
                 }
                 userDetails = result;
                 farePlanId = result.membershipId.farePlan;
                 return callback(null, result);
             });
        // }
         /!*else {*!/
             Member.findOne({'_id': vehiclesDetails.currentAssociationId}, function (err, result) {
                 if (err) {
                     return callback(err, null);
                 }
                 userDetails = result;
                 return callback(null, result);
             });
        // }


 },
*!/
 /!*function (callback) {

     CheckIn.findByIdAndUpdate(checkInDetails._id, {$set: {'user': userDetails._id}}, function (err, result) {
         if (err) {
             return callback(err, null);
         }
         return callback(null, result);
     });
 },
*!/
           /!* function (callback) {
                CheckOut.find
            }
            ,*!/
            function (callback) {
                /!*CheckOut.findOne({"$and":[{'vehicleId':{ $elemMatch: { $eq :record.vehicleId} },
                                            'status':{ $elemMatch: { $eq: 'Open'} },
                                            'checkOutTime':{ $elemMatch: {$lt:record.checkInTime} } }]}).sort({'checkOutTime': -1}).exec(function (err,result) {
*!/

                        CheckOut.findOne({
                    'vehicleId': record.vehicleId,
                    'status': 'Open',
                            'checkOutTime': {$lt:moment(record.checkInTime)}
                }).sort({'checkOutTime': -1}).exec(function (err, result) {
                    if (err) {
                        return callback();
                    }
                    if(result) {
                        checkOutDetails = result;
                    }
                    return callback(null, result);
                });
            },


            /!* function (callback) {
                 if (userDetails.role == 'member') {
                     var checkintime = moment(record.checkInTime);
                     var checkouttime = moment(checkOutDetails.checkOutTime);
                     duration = checkintime.diff(checkouttime, 'minutes');
                 }
             },*!/

            function (callback) {
                if(ismember && checkOutDetails!=0)
                {
                    var checkInTime = moment(record.checkInTime);
                    var checkOutTime = moment(checkOutDetails.checkOutTime);

                    var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                    duration = durationMin.asMinutes();
                    FarePlanService.calculateFarePlan(farePlanId, duration, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        creditUsed = result;
                        return callback(null, result);
                    });
                }
                else
                {
                    return callback(null,null);
                }

            },
        function (callback) {
                if(ismember && checkOutDetails!=0) {
                     balance = Number(memberObject.creditBalance) - creditUsed;
                    Member.findByIdAndUpdate(memberObject._id, {
                        $set:{'creditBalance': balance}
                    }, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        memberObject = result;
                        return callback(null, result);

                    });
                }
                else {
                    return callback(null,null);
                }
        },

 function (callback) {
    if (checkOutDetails!=0) {
        var transactionAssoc = {
            checkInEntry: record._id,
            checkOutEntry: checkOutDetails._id
        };
        TransactionAssociation.create(transactionAssoc, function (err, result) {
            if (err) {
                return callback(err, null);
            }
            transAssociation = result;
            return callback(null, result);
        });
    }else
    {
        return callback(null,null);
    }

 },
            function (callback) {
     if(transAssociation) {
         CheckIn.findByIdAndUpdate(transAssociation.checkInEntry, {$set: {'status': 'Close'}}, {new: true}, function (err, result) {
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

            },
        function (callback) {
            if(transAssociation) {
                CheckOut.findByIdAndUpdate(transAssociation.checkOutEntry, {$set: {'status': 'Close'}}, function (err, result) {
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
     if(transAssociation) {
         var transaction;
         if (ismember) {

             transaction = {
                 user: record.user,
                 vehicle: record.vehicleId,
                 fromPort: checkOutDetails.fromPort,
                 toPort: record.toPort,
                 checkOutTime: checkOutDetails.checkOutTime,
                 checkInTime: record.checkInTime,
                 duration: duration,
                 creditsUsed: creditUsed,
                 creditBalance: balance,
                 status: 'Close'
             };
         }
         else {
             transaction = {
                 user: record.user,
                 vehicle: record.vehicleId,
                 fromPort: checkOutDetails.fromPort,
                 toPort: record.toPort,
                 checkOutTime: checkOutDetails.checkOutTime,
                 checkInTime: record.checkInTime,
                 status: 'Close'
             };
         }

         Transaction.create(transaction, function (err, result) {
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

 }],
        function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            console.log('Checkin Success : '+result);
            return callback(null,checkInDetails);
        });
};*/

exports.ReconcileTransaction=function () {
var checkinDetails;
    var balance;
    var comments = '-';
    async.series([
        function (callback) {
            CheckIn.find({'status':'Open','errorStatus':0,'updateStatus':1}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
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
                        'vehicleId': checkinDetail.vehicleId,
                        'status': 'Open',
                        'updateStatus':1,
                        'checkOutTime': {$lt:moment(checkinDetail.checkInTime)}
                    }).sort({'checkOutTime': -1}).exec(function (err, result) {
                        if (err) {
                            return console.error('Error : '+err);
                        }
                        if(result) {
                            User.findOne({'_id':result.user}).deepPopulate('membershipId').lean().exec(function (err,userdetails) {
                                if(err)
                                {
                                    return console.error('Reconciliation User Error : '+err);
                                }
                                if(!userdetails)
                                {
                                    return console.log('User id not found : '+result.user);
                                }
                                if(userdetails._type=='member'&& (userdetails.status==Constants.MemberStatus.REGISTERED || userdetails.status==Constants.MemberStatus.RENEWED))
                                {
                                    var checkInTime = moment(checkinDetail.checkInTime);
                                    var checkOutTime = moment(result.checkOutTime);

                                    var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                                    var duration = durationMin.asMinutes();

                                    Membership.findOne({'_id':userdetails.membershipId},function (err,membership) {
                                        if(err)
                                        {
                                            return console.error('Reconciliation Membership Error : '+err);
                                        }


                                    FarePlanService.calculateFarePlan(membership.farePlan, duration, function (err, creditUsed) {

                                        if (err) {
                                            return console.log('Error Fare plan calculation'+err);
                                        }
                                        balance = Number(userdetails.creditBalance) - creditUsed;
                                        /*if(balance<0)
                                        {
                                            userdetails.comments = 'Your balance was :'+balance+' on '+moment().format('DD-MM-YYYY')+'. Negative balance recovered from security deposit on the last bicycle checkin';
                                            userdetails.securityDeposit=userdetails.securityDeposit+balance;
                                            balance = 0;
                                        }*/
                                        Member.findByIdAndUpdate(result.user,{$set: {'creditBalance': balance/*,'securityDeposit':userdetails.securityDeposit,'comments':userdetails.comments*/}}, {new: true},function (err, updatedUser) {
                                            if (err) {
                                                return console.error('Error '+err);
                                            }
                                            var transactionAssoc = {
                                                checkInEntry: checkinDetail._id,
                                                checkOutEntry: result._id
                                            };
                                            TransactionAssociation.create(transactionAssoc, function (err, transAssociation) {
                                                if (err) {
                                                    return console.error('Error '+err);
                                                }
                                                CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close'}}, {new: true}, function (err, cin) {
                                                    if (err) {
                                                        return console.error('Error '+err);
                                                    }
                                                });
                                                CheckOut.findByIdAndUpdate(result._id, {$set: {'status': 'Close'}}, {new: true}, function (err, cout) {
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
                                                    creditsUsed: creditUsed,
                                                    creditBalance: balance,
                                                    status: 'Close'
                                                };
                                                Transaction.create(transaction, function (err, trans) {
                                                    if (err) {
                                                        return console.error('Error '+err);
                                                    }
                                                });
                                            });

                                        });
                                        //creditUsed = result;
                                        //return callback(null, result);
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
        if(result[0].length>0)
        {
            return console.log(result);
        }

    });
};
