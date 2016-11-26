/**
 * Created by root on 12/11/16.
 */

var async = require('async'),
    User = require('../models/user'),
    Port = require('../models/port'),
    Checkout = require('../models/checkout'),
    Checkin = require('../models/checkin'),
    vehicle = require('../models/vehicle');

var MemberService = require('../services/transaction-service');

exports.BridgeCheckout=function (record,callback) {
    var vehicleDetails=0;
    var requestDetails;
    var userDetails=0;
    var portDetails=0;
    var checkoutDetails;
    var details = {user :'',
    vehicleId : '',
    fromPort:'',
        checkOutTime:'',
        status:''};

    async.series([
        function (callback) {
            User.findOne({'UserID':record.cardId},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                userDetails=result;
                details.user=result.UserID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            vehicle.findOne({'vehicleUid':record.vehicleId},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({'PortID':record.fromPort},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                portDetails = result;
                details.fromPort = result.PortID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(vehicleDetails!=0 && portDetails!=0 && userDetails!=0)
            {
                requestDetails ={
                    cardId:userDetails.smartCardNumber,
                    vehicleId:vehicleDetails.vehicleRFID,
                    fromPort:portDetails._id,
                    checkOutTime:record.checkOutTime
                };
                MemberService.checkout(requestDetails,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    checkoutDetails= result;
                    return callback(null,result);
                });
            }

        },
        function (callback) {
            if (checkoutDetails) {
                /*Checkout.findOne(checkoutDetails).deepPopulate('user vehicleId fromPort').lean().exec(function (err, result) {
                    if (err) {
                        return callback(err, null);
                    }*/
                    details.checkOutTime=checkoutDetails.checkOutTime;
                    details.status=checkoutDetails.status;

                    return callback(null, null);
               /* });*/
            }
        }
    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,details);
    });
};

exports.BridgeCheckin=function (record,callback) {

    var vehicleDetails=0;
    var requestDetails;
    var portDetails=0;
    var userDetails;
    var checkinDetails=0;
    var details = {user :'',
        vehicleId : '',
        toPort:'',
        checkInTime:'',
        status:''};

    async.series([
        function (callback) {
            vehicle.findOne({'vehicleUid':record.vehicleId},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({'PortID':record.toPort},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                portDetails = result;
                details.toPort = result.PortID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(vehicleDetails!=0 && portDetails!=0)
            {
                requestDetails ={
                    vehicleId:vehicleDetails.vehicleRFID,
                    toPort:portDetails._id,
                    checkInTime:record.checkInTime
                };
                MemberService.checkin(requestDetails,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    checkinDetails= result;
                    return callback(null,result);
                });
            }
            else {
                return callback(null, null);
            }
        },
        function (callback) {
            if (checkinDetails) {
                /*Checkout.findOne(checkoutDetails).deepPopulate('user vehicleId fromPort').lean().exec(function (err, result) {
                 if (err) {
                 return callback(err, null);
                 }*/
                details.checkInTime=checkinDetails.checkInTime;
                details.status=checkinDetails.status;
                if(checkinDetails.user) {
                    User.findOne({'_id': checkinDetails.user}, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        details.user = result.UserID;
                        return callback(null, result);
                    });
                }


            return callback(null,null);
                /* });*/
            }
            else {
                return callback(null, null);
            }

        }
    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,details);
    });


};