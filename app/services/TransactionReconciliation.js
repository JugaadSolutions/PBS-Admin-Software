var async = require('async'),
    moment = require('moment'),
    CheckOut=require('../models/checkout'),
    CheckIn=require('../models/checkin'),
    vehicle = require('../models/vehicle'),
    User = require('../models/user'),
    Member = require('../models/member'),
    DockPort=require('../models/dock-port'),
    Port = require('../models/port');
var fleet = require('../models/fleet');

var TransactionAssociation = require('../models/transaction-association'),
    Transaction = require('../models/transaction');


exports.ReconcileTransaction=function (record,callback) {

    var userDetails=0;
    var vehiclesDetails;
    var dockingPortDetails;
    var checkInDetails;
    var checkOutDetails=0;
    var farePlanId;
    var checkinEntry;
    var errorstatus=0;
    var errormsg='';
    var duration;
    var transAssociation=0;

    async.series([
        /*function (callback) {
            vehicle.findById(record.vehicleId,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                vehiclesDetails=result;
                return callback(null,result);
            });
        },*/

 /*function (callback) {

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
*/
 /*function (callback) {

     CheckIn.findByIdAndUpdate(checkInDetails._id, {$set: {'user': userDetails._id}}, function (err, result) {
         if (err) {
             return callback(err, null);
         }
         return callback(null, result);
     });
 },
*/          
           /* function (callback) {
                CheckOut.find
            }
            ,*/
            function (callback) {
                /*CheckOut.findOne({"$and":[{'vehicleId':{ $elemMatch: { $eq :record.vehicleId} },
                                            'status':{ $elemMatch: { $eq: 'Open'} },
                                            'checkOutTime':{ $elemMatch: {$lt:record.checkInTime} } }]}).sort({'checkOutTime': -1}).exec(function (err,result) {
*/

                        CheckOut.findOne({
                    'vehicleId': record.vehicleId,
                    'status': 'Open'
                }).sort({'checkOutTime': -1}).exec(function (err, result) {
                    if (err) {
                        return callback();
                    }
                    checkOutDetails = result;
                    return callback(null, result);
                });
            },


            /* function (callback) {
                 if (userDetails.role == 'member') {
                     var checkintime = moment(record.checkInTime);
                     var checkouttime = moment(checkOutDetails.checkOutTime);
                     duration = checkintime.diff(checkouttime, 'minutes');
                 }
             },*/


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
    }

 },
            function (callback) {
                CheckIn.findByIdAndUpdate(transAssociation.checkInEntry,{$set:{'status':'Close'}},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });

            },
        function (callback) {
            CheckOut.findByIdAndUpdate(transAssociation.checkOutEntry,{$set:{'status':'Close'}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
            ,
 function (callback) {

         var transaction = {
             user: record.user,
             vehicle:record.vehicleId,
             fromPort: checkOutDetails.fromPort,
             toPort: record.toPort,
             checkOutTime: checkOutDetails.checkOutTime,
             checkInTime: record.checkInTime,
             status: 'Close'
         };
         Transaction.create(transaction, function (err, result) {
             if (err) {
                 return callback(err, null);
             }
             return callback(null, result);
         });

 }],
        function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,record);
        });
};

