var async = require('async'),
    User = require('../models/user'),
    moment = require('moment-timezone'),
    vehicle = require('../models/vehicle');

var MemberService = require('../services/transaction-service');


exports.checkoutApp=function (record,callback) {
    var details=0;
    var requestDetails;
    var userDetails;
    var checkoutDetails;
    async.series([
        function (callback) {
            User.findOne({'cardNum':record.cardId},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                userDetails=result;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            vehicle.findOne({'vehicleNumber':record.vehicleId},function (err,result) {
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
                    cardId:userDetails.smartCardNumber,
                    vehicleId:details.vehicleRFID,
                    fromPort:record.fromPort,
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

        }
    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,checkoutDetails);
    });



};

exports.checkinApp=function (record,callback) {

    var details=0;
    var requestDetails;
    var userDetails;
    var checkinDetails;
    async.series([
        function (callback) {
            vehicle.findOne({'vehicleNumber':record.vehicleId},function (err,result) {
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
               /* var format = 'YYYY/MM/DD HH:mm:ss ZZ';
                record.checkInTime =  moment(record.checkInTime, format).tz("Asia/Kolkata").format(format);
                console.log(record.checkInTime.toString());*/
                requestDetails ={
                    vehicleId:details.vehicleRFID,
                    toPort:record.toPort,
                    checkInTime:record.checkInTime
                };
                /*console.log(record.checkInTime);
                console.log(record.checkInTime.toString());*/
                MemberService.checkin(requestDetails,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    checkinDetails= result;
                    return callback(null,result);
                });
            }

        }
    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,checkinDetails);
    });


};