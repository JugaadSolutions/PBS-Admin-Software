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

var couts = [];
/*exports.ReconcileTransaction=function () {
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
                                            /!* if (!creditUsed) {
                                             return console.log('Error Fare plan calculation'+err);
                                             }*!/
                                            balance = Number(userdetails.creditBalance) - creditUsed;
                                            /!*if(balance<0)
                                             {
                                             userdetails.comments = 'Your balance was :'+balance+' on '+moment().format('DD-MM-YYYY')+'. Negative balance recovered from security deposit on the last bicycle checkin';
                                             userdetails.securityDeposit=userdetails.securityDeposit+balance;
                                             balance = 0;
                                             }*!/
                                            Member.findById(result.user,function (err,memDetails) {
                                                if(err)
                                                {
                                                    return console.log('Error finding member '+err);
                                                }
                                                if(!result)
                                                {
                                                    return console.log('Error finding member to update balance after checkin');
                                                }
                                                if(userdetails.creditBalance!=balance)
                                                {
                                                    memDetails.creditBalance = balance;
                                                    memDetails.vehicleId = [];
                                                    Member.update({_id:memDetails._id},memDetails, {new: true}).lean().exec(function (err, updatedUser) {
                                                        if (err) {
                                                            return console.error('Error updating Member at reconcilation'+err);
                                                        }
                                                        /!*Card.findByIdAndUpdate(memDetails.smartCardId,{$set:{balance:memDetails.creditBalance}},function (err) {
                                                         if (err) {
                                                         return console.error('Error updating card at reconcilation'+err);
                                                         }
                                                         });*!/
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
                                                                     console.error('Error Ignore if it is Duplicate entry error '+err);
                                                                }
                                                            });
                                                        });

                                                    });
                                                }
                                                else {
                                                    memDetails.vehicleId = [];
                                                    Member.findByIdAndUpdate(memDetails._id,memDetails, {new: true}).lean().exec(function (err, updatedUser) {
                                                        if (err) {
                                                            return console.error('Error updating Member at reconcilation'+err);
                                                        }
                                                        /!*Card.findByIdAndUpdate(memDetails.smartCardId,{$set:{balance:memDetails.creditBalance}},function (err) {
                                                         if (err) {
                                                         return console.error('Error updating card at reconcilation'+err);
                                                         }
                                                         });*!/
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
                                                                     console.error('Error Ignore if it is Duplicate entry error '+err);
                                                                }
                                                            });
                                                        });

                                                    });
                                                }

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

                                    /!*User.*!/
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
                                                console.error('Error Ignore if it is Duplicate entry error '+err);
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
        /!*        if(result[0].length>0)
         {
         return console.log(result);
         }*!/

    });
};*/

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
                    async.waterfall([
                        function (callback) {
                            CheckOut.findOne({vehicleId: checkinDetail.vehicleId, status: 'Open', updateStatus:1, checkOutTime: {$lt:moment(checkinDetail.checkInTime)}}).sort({checkOutTime: -1}).deepPopulate('user vehicleId fromPort ').exec(function (err, checkoutData) {
                                if (err) {
                                    return callback(err,null);
                                }
                                if(checkoutData)
                                {
                                    return callback(null,checkoutData);
                                }
                                else
                                {
                                    return callback(new Error('No matching checkout found'),null);
                                }
                            });
                        },
                        function (checkoutData,callback) {
                            User.findById(checkoutData.user._id).deepPopulate('membershipId').lean().exec(function (err,userdetails) {
                                if (err) {
                                    return callback(err,null);
                                }
                                if (!userdetails) {
                                    return callback(new Error('User id not found : '+userdetails.user),null);
                                }
                                var checkInTime = moment(checkinDetail.checkInTime);
                                var checkOutTime = moment(checkoutData.checkOutTime);

                                var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                                var duration = durationMin.asMinutes();
                                if(userdetails._type=='member'&& (userdetails.status==Constants.MemberStatus.REGISTERED)) {
                                    Membership.findById(userdetails.membershipId,function (err,membership) {
                                        if(err)
                                        {
                                            return callback(err,null);
                                        }
                                        if(!membership)
                                        {
                                            return callback(new Error('No membership found by this id while reconsiling'),null);
                                        }
                                        FarePlanService.calculateFarePlan(membership.farePlan, duration, function (err, creditUsed) {

                                            if (err) {
                                                return callback(err,null);
                                            }
                                            var bal = Number(userdetails.creditBalance) - creditUsed;
                                            Member.findById(userdetails._id,function (err,memDetails) {
                                                if (err) {
                                                    return callback(err,null);
                                                }
                                                if (!memDetails) {
                                                    return callback(new Error('No member found by this id while reconsiling'),null);
                                                }
                                                if(memDetails.creditBalance!=bal)
                                                {
                                                    memDetails.creditBalance = bal;
                                                    memDetails.lastModifiedAt = new Date();
                                                }
                                                memDetails.vehicleId=[];
                                                Member.findByIdAndUpdate(memDetails._id,memDetails,{new:true},function (err,mem) {
                                                    if(err)
                                                    {
                                                        return callback(err,null);
                                                    }
                                                    var transactionAssoc = {
                                                        checkInEntry: checkinDetail._id,
                                                        checkOutEntry: checkoutData._id
                                                    };

                                                    TransactionAssociation.create(transactionAssoc, function (err) {
                                                        if (err) {
                                                            return callback(err,null);
                                                        }

                                                        CheckOut.findByIdAndUpdate(checkoutData._id, {$set: {'status': 'Close'}}, function (err) {
                                                            if (err) {
                                                                return callback(err,null);
                                                            }
                                                            CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close'}}, function (err) {
                                                                if (err) {
                                                                    return callback(err,null);
                                                                }
                                                            });
                                                        });
                                                        var transaction = {
                                                            user: checkoutData.user._id,
                                                            vehicle: checkoutData.vehicleId._id,
                                                            fromPort: checkoutData.fromPort._id,
                                                            toPort: checkinDetail.toPort._id,
                                                            checkOutTime: checkoutData.checkOutTime,
                                                            checkInTime: checkinDetail.checkInTime,
                                                            duration: duration,
                                                            creditsUsed: creditUsed,
                                                            creditBalance: bal,
                                                            uid:checkoutData.user.UserID,
                                                            vid:checkoutData.vehicleId.vehicleUid,
                                                            fportid:checkoutData.fromPort.PortID,
                                                            tportid:checkinDetail.toPort.PortID,
                                                            status: 'Close'
                                                        };
                                                        Transaction.create(transaction, function (err,res) {
                                                            if (err) {
                                                                return callback(err,null);
                                                            }
                                                            return callback(null,res);
                                                        });
                                                    });
                                                });
                                            });
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
                                    var transactionAssoc = {
                                        checkInEntry: checkinDetail._id,
                                        checkOutEntry: checkoutData._id
                                    };
                                    TransactionAssociation.create(transactionAssoc, function (err) {
                                        if (err) {
                                            return callback(err,null);
                                        }

                                        CheckOut.findByIdAndUpdate(checkoutData._id, {$set: {'status': 'Close'}}, {new: true}, function (err) {
                                            if (err) {
                                                return callback(err,null);
                                            }
                                            CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close'}}, {new: true}, function (err) {
                                                if (err) {
                                                    return callback(err,null);
                                                }
                                            });
                                        });
                                        var transaction = {
                                            user: checkoutData.user,
                                            vehicle: checkoutData.vehicleId,
                                            fromPort: checkoutData.fromPort,
                                            toPort: checkinDetail.toPort,
                                            checkOutTime: checkoutData.checkOutTime,
                                            checkInTime: checkinDetail.checkInTime,
                                            duration: duration,
                                            creditsUsed: 0,
                                            creditBalance: 0,
                                            status: 'Close'
                                        };
                                        Transaction.create(transaction, function (err,res) {
                                            if (err) {
                                                return callback(err,null);
                                            }
                                            return callback(null,res);
                                        });
                                    });
                                }

                            });
                        }
                    ],function (err,result) {
                        if(err)
                        {
                            console.error("Error in reconcilation"+err);
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

exports.Associater=function () {
    var checkinDetails;
    var balance;
    var comments = '-';
    var tempCheckout;
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
                    async.waterfall([
                        function (callback) {
                            CheckOut.findOne({vehicleId: checkinDetail.vehicleId, status: 'Open', updateStatus:1, checkOutTime: {$lt:moment(checkinDetail.checkInTime)}}).sort({checkOutTime: -1}).deepPopulate('user vehicleId fromPort ').exec(function (err, checkoutData) {
                                if (err) {
                                    return callback(err,null);
                                }
                                if(checkoutData)
                                {
                                    tempCheckout = checkoutData;
                                    return callback(null,checkoutData);
                                }
                                else
                                {
                                    return callback(new Error('No matching checkout found'),null);
                                }
                            });
                        },
                        function (checkoutData,callback) {
                            if(checkoutData)
                            {
                                //var  u = getUser(tempCheckout.user._id);
                                associate(checkoutData,checkinDetail,function (err,result) {
                                    if(err)
                                    {
                                        return callback(err,null);
                                    }
                                    return callback(null,result);
                                });
                                //console.log(JSON.stringify(u));
                                /*User.findById(tempCheckout.user._id).deepPopulate('membershipId').lean().exec(function (err,userdetails) {
                                    if (err) {
                                        return callback(err, null);
                                    }
                                    if (!userdetails) {
                                        return callback(new Error('User id not found : ' + userdetails.user), null);
                                    }

                                });*/
                            }
                            else
                            {
                                return callback(null,null);
                            }
                        }
                       /* ,
                        function (checkoutData,callback) {
                            User.findById(checkoutData.user._id).deepPopulate('membershipId').lean().exec(function (err,userdetails) {
                                if (err) {
                                    return callback(err,null);
                                }
                                if (!userdetails) {
                                    return callback(new Error('User id not found : '+userdetails.user),null);
                                }
                                var checkInTime = moment(checkinDetail.checkInTime);
                                var checkOutTime = moment(checkoutData.checkOutTime);

                                var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                                var duration = durationMin.asMinutes();
                                if(userdetails._type=='member'&& (userdetails.status==Constants.MemberStatus.REGISTERED)) {
                                    Membership.findById(userdetails.membershipId,function (err,membership) {
                                        if(err)
                                        {
                                            return callback(err,null);
                                        }
                                        if(!membership)
                                        {
                                            return callback(new Error('No membership found by this id while reconsiling'),null);
                                        }
                                        FarePlanService.calculateFarePlan(membership.farePlan, duration, function (err, creditUsed) {

                                            if (err) {
                                                return callback(err,null);
                                            }
                                            var bal = Number(userdetails.creditBalance) - creditUsed;
                                            Member.findById(userdetails._id,function (err,memDetails) {
                                                if (err) {
                                                    return callback(err,null);
                                                }
                                                if (!memDetails) {
                                                    return callback(new Error('No member found by this id while reconsiling'),null);
                                                }
                                                if(memDetails.creditBalance!=bal)
                                                {
                                                    memDetails.creditBalance = bal;
                                                    memDetails.lastModifiedAt = new Date();
                                                }
                                                memDetails.vehicleId=[];
                                                Member.findByIdAndUpdate(memDetails._id,memDetails,{new:true},function (err,mem) {
                                                    if(err)
                                                    {
                                                        return callback(err,null);
                                                    }
                                                    var transactionAssoc = {
                                                        checkInEntry: checkinDetail._id,
                                                        checkOutEntry: checkoutData._id
                                                    };

                                                    TransactionAssociation.create(transactionAssoc, function (err) {
                                                        if (err) {
                                                            return callback(err,null);
                                                        }

                                                        CheckOut.findByIdAndUpdate(checkoutData._id, {$set: {'status': 'Close'}}, function (err) {
                                                            if (err) {
                                                                return callback(err,null);
                                                            }
                                                            CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close'}}, function (err) {
                                                                if (err) {
                                                                    return callback(err,null);
                                                                }
                                                            });
                                                        });
                                                        var transaction = {
                                                            user: checkoutData.user._id,
                                                            vehicle: checkoutData.vehicleId._id,
                                                            fromPort: checkoutData.fromPort._id,
                                                            toPort: checkinDetail.toPort._id,
                                                            checkOutTime: checkoutData.checkOutTime,
                                                            checkInTime: checkinDetail.checkInTime,
                                                            duration: duration,
                                                            creditsUsed: creditUsed,
                                                            creditBalance: bal,
                                                            uid:checkoutData.user.UserID,
                                                            vid:checkoutData.vehicleId.vehicleUid,
                                                            fportid:checkoutData.fromPort.PortID,
                                                            tportid:checkinDetail.toPort.PortID,
                                                            status: 'Close'
                                                        };
                                                        Transaction.create(transaction, function (err,res) {
                                                            if (err) {
                                                                return callback(err,null);
                                                            }
                                                            return callback(null,res);
                                                        });
                                                    });
                                                });
                                            });
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
                                    var transactionAssoc = {
                                        checkInEntry: checkinDetail._id,
                                        checkOutEntry: checkoutData._id
                                    };
                                    TransactionAssociation.create(transactionAssoc, function (err) {
                                        if (err) {
                                            return callback(err,null);
                                        }

                                        CheckOut.findByIdAndUpdate(checkoutData._id, {$set: {'status': 'Close'}}, {new: true}, function (err) {
                                            if (err) {
                                                return callback(err,null);
                                            }
                                            CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close'}}, {new: true}, function (err) {
                                                if (err) {
                                                    return callback(err,null);
                                                }
                                            });
                                        });
                                        var transaction = {
                                            user: checkoutData.user,
                                            vehicle: checkoutData.vehicleId,
                                            fromPort: checkoutData.fromPort,
                                            toPort: checkinDetail.toPort,
                                            checkOutTime: checkoutData.checkOutTime,
                                            checkInTime: checkinDetail.checkInTime,
                                            duration: duration,
                                            creditsUsed: 0,
                                            creditBalance: 0,
                                            status: 'Close'
                                        };
                                        Transaction.create(transaction, function (err,res) {
                                            if (err) {
                                                return callback(err,null);
                                            }
                                            return callback(null,res);
                                        });
                                    });
                                }

                            });
                        }*/
                    ],function (err,result) {
                        if(err)
                        {
                            //console.error("Error in reconcilation"+err);
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
           // return console.log(err);
        }
        /*        if(result[0].length>0)
         {
         return console.log(result);
         }*/

    });
};

function associate(cout,cin,callback) {
    async.waterfall([
        function (callback) {
            TransactionAssociation.findOne({checkOutEntry:cout._id},function (err,trans) {
                if(err)
                {
                    return callback(err,null);
                }
                if(trans)
                {
                    return callback(new Error('This entry has already been created'),null);
                }
                else {
                    return callback(null,cout);
                }
                
            });
        },
        function (cout,callback) {
            var data = {
                checkOutEntry:cout._id,
                checkInEntry:cin._id
            };
            TransactionAssociation.create(data,function (err,trans) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,trans);
            });
        },
        function (trans,callback) {
            CheckOut.findByIdAndUpdate(trans.checkOutEntry, {$set: {'status': 'Close'}}, {new: true}, function (err,result) {
                if (err) {
                    return callback(err,null);
                }
                return callback(null,trans);
            });
        },
        function (trans,callback) {
            CheckIn.findByIdAndUpdate(trans.checkInEntry, {$set: {'status': 'Close'}}, {new: true}, function (err,result) {
                if (err) {
                    return callback(err,null);
                }
                return callback(null,trans);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
}

exports.reconse = function () {
    var openTrans;
    var checkout;
    var checkin;
    var user;
    var isMember=true;
    var checkInTime;
    var checkOutTime;
    var duration=0;
    var memberShip;
    var balance=0;
    var creditUsed=0;
    async.series([
        function (callback) {
            TransactionAssociation.findOne({status:"Open"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("No open association found"),null);
                }
                openTrans = result;
                return callback(null,result);
            });
        },
        function (callback) {
            CheckOut.findById(openTrans.checkOutEntry).deepPopulate('user vehicleId fromPort').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("CHeckout not found in reconsile"),null);
                }
                checkout = result;
                return callback(null,result);
            });
        },
        function (callback) {
            CheckIn.findById(openTrans.checkInEntry).deepPopulate('toPort vehicleId').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("CHeckin not found in reconsile"),null);
                }
                checkin = result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.findById(checkout.user._id).deepPopulate('membershipId').lean().exec(function (err,userdetails) {
                if (err) {
                    return callback(err, null);
                }
                if (!userdetails) {
                    return callback(new Error('User id not found : ' + userdetails.user), null);
                }
                if(userdetails._type!="member")
                {
                    isMember=false;
                }
                user = userdetails;
                checkInTime = moment(checkin.checkInTime);
                checkOutTime = moment(checkout.checkOutTime);
                var durationMin = moment.duration(checkInTime.diff(checkOutTime));
                duration = durationMin.asMinutes();
                return callback(null,userdetails);
            });
        },
        function (callback) {
            if(isMember)
            {
                Membership.findById(user.membershipId,function (err,membership) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (!membership) {
                        return callback(new Error('No membership found by this id while reconsiling'), null);
                    }
                    memberShip = membership;
                    return callback(null,membership);
                });   
            }
            else 
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(isMember)
            {
                FarePlanService.calculateFarePlan(memberShip.farePlan, duration, function (err, usedCredit) {
                    if (err) {
                        return callback(err, null);
                    }
                    creditUsed = usedCredit;
                    balance = Number(user.creditBalance) - usedCredit;
                    return callback(null,creditUsed);
                });
            }
            else 
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(isMember)
            {
                Member.findById(user._id,function (err,memDetails) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (!memDetails) {
                        return callback(new Error('No member found by this id while reconsiling'), null);
                    }
                    if (memDetails.creditBalance != balance) {
                        memDetails.creditBalance = balance;
                        memDetails.lastModifiedAt = new Date();
                    }
                    memDetails.vehicleId = [];
                    Member.findByIdAndUpdate(memDetails._id, memDetails, {new: true}, function (err, mem) {
                        if (err) {
                            return callback(err, null);
                        }
                        return callback(null,mem);
                    });
                });
            }
            else 
            {
                return callback(null,null);   
            }
        },
        function (callback) {
            if(isMember)
            {
                return callback(null,null);
            }
            else 
            {
                if (user.vehicleId.length > 0) {
                    for (var i = 0; i < user.vehicleId.length; i++) {
                        if (user.vehicleId[i].vehicleid.equals(checkin.vehicleId)) {
                            user.vehicleId.splice(i, 1);
                        }
                        if(i==user.vehicleId.length-1)
                        {
                            User.findByIdAndUpdate(user._id,user,function (err,result) {
                                if(err)
                                {
                                    return callback(err,null);
                                }
                                return callback(null,result)
                            });
                        }
                    }
                }
                else 
                {
                    return callback(null,null);
                }
            }
        },
        function (callback) {
                var transaction = {
                    user: checkout.user._id,
                    vehicle: checkout.vehicleId._id,
                    fromPort: checkout.fromPort._id,
                    toPort: checkin.toPort._id,
                    checkOutTime: checkout.checkOutTime,
                    checkInTime: checkin.checkInTime,
                    duration: duration,
                    creditsUsed: creditUsed,
                    creditBalance: balance,
                    uid:checkout.user.UserID,
                    vid:checkout.vehicleId.vehicleUid,
                    fportid:checkout.fromPort.PortID,
                    tportid:checkin.toPort.PortID,
                    status: 'Close'
                };

            Transaction.create(transaction, function (err,res) {
                if (err) {
                    if(err.code==11000)
                    {
                        return callback(null,null);
                    }
                    return callback(err,null);
                }
                return callback(null,res);
            });
        },
        function (callback) {
            TransactionAssociation.findByIdAndUpdate(openTrans._id,{$set:{status:"Close"}},function (err,result) {
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
          //  return console.log(err);
        }
    })
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