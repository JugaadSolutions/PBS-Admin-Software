/*
var async = require('async'),
    User = require('../models/user'),
    Port = require('../models/port'),
    Checkout = require('../models/checkout'),
    Checkin = require('../models/checkin'),
    CheckoutError = require('../models/checkoutError'),
    CheckinError = require('../models/checkinError'),
    vehicle = require('../models/vehicle');

var MemberService = require('../services/transaction-service');



exports.checkoutApp=function (record,callback) {
    var vehicleDetails;
    var requestDetails;
    var userDetails;
    var portDetails;
    var checkoutDetails;
    var errorstatus=0;
    var errormsg='';
    var details = {user :'',
        vehicleId : '',
        fromPort:'',
        checkOutTime:'',
        status:'',
        errorStatus:0,
        errorMsg:''};

    async.series([
        function (callback) {
            User.findOne({$or: [{'cardNum':record.cardId}, {'smartCardNumber': record.cardId}]},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.user=record.cardId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No user found by this id';
                    details.vehicleId = record.cardId;
                    return callback(null,null);
                }
                userDetails=result;
                details.user=result.UserID;
                console.log('Card num - '+record.cardId+' User id - '+result._id);
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            //console.log('Vehicle nums : '+record.vehicleId);
            vehicle.findOne({$or: [{'vehicleNumber':record.vehicleId}, {'vehicleRFID': record.vehicleId}]},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No vehicle found by this id';
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                console.log('Vehicle num - '+record.vehicleId+' Vehicle - '+result._id);
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({'_id':record.fromPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.fromPort = record.fromPort;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No port found by this id';
                    details.vehicleId = record.fromPort;
                    return callback(null,null);
                }
                portDetails = result;
                details.fromPort = result.PortID;
                console.log('Port num - '+record.fromPort+' Port - '+result._id);
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(errorstatus==0)
            {
                requestDetails ={
                    user:userDetails._id,
                    vehicleId:vehicleDetails._id,
                    fromPort:portDetails._id,
                    checkOutTime:record.checkOutTime
                };
                MemberService.checkout(requestDetails,function (err,result) {
                    if(err)
                    {
                        errorstatus=1;
                        errormsg=errormsg+':'+err;
                        return callback(null,null);
                    }
                    checkoutDetails= result;
                    return callback(null,result);
                });
            }
            else
            {
                details.checkOutTime = record.checkOutTime;
                details.errorStatus = errorstatus;
                details.errorMsg = errormsg;
                CheckoutError.create(details,function (err,result) {
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

            /!*Checkout.findOne(checkoutDetails).deepPopulate('user vehicleId fromPort').lean().exec(function (err, result) {
             if (err) {
             return callback(err, null);
             }*!/
            details.checkOutTime=checkoutDetails.checkOutTime;
            details.status=checkoutDetails.status;
            details.errorStatus = checkoutDetails.errorStatus;
            details.errorMsg = checkoutDetails.errorMsg+" : "+errormsg;
            return callback(null, null);
            /!* });*!/

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
    var vehicleDetails;
    var requestDetails;
    var portDetails;
    var userDetails;
    var checkinDetails;
    var errorstatus=0;
    var errormsg='';
    var details = {user :'',
        vehicleId : '',
        toPort:'',
        checkInTime:'',
        status:'',
        errorStatus:0,
        errorMsg:''};

    async.series([
        function (callback) {
            vehicle.findOne({'vehicleNumber':record.vehicleId},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No vehicle found by this id';
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({'_id':record.toPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.fromPort = record.toPort;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No port found by this id';
                    details.vehicleId = record.toPort;
                    return callback(null,null);
                }
                portDetails = result;
                details.toPort = result.PortID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(errorstatus==0)
            {
                requestDetails ={
                    vehicleId:vehicleDetails._id,
                    toPort:portDetails._id,
                    checkInTime:record.checkInTime
                };
                MemberService.checkin(requestDetails,function (err,result) {
                    if(err)
                    {
                        errorstatus=1;
                        errormsg=errormsg+':'+err;
                        return callback(null,null);
                    }
                    checkinDetails= result;
                    return callback(null,result);
                });
            }
            else {
                details.checkInTime = record.checkInTime;
                details.errorStatus = errorstatus;
                details.errorMsg = errormsg;
                CheckinError.create(details,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    checkinDetails= result;
                    return callback(null,result);
                });
            }
        },
        function (callback) {
            if (checkinDetails && errorstatus==0 && checkinDetails.errorStatus==0) {
                /!*Checkout.findOne(checkoutDetails).deepPopulate('user vehicleId fromPort').lean().exec(function (err, result) {
                 if (err) {
                 return callback(err, null);
                 }*!/
                details.checkInTime=checkinDetails.checkInTime;
                details.status=checkinDetails.status;
                if(checkinDetails.user) {
                    User.findOne({'_id': checkinDetails.user}, function (err, result) {
                        if (err) {
                            return callback(null, null);
                        }
                        details.user = result.UserID;
                        return callback(null, result);
                    });
                }


                return callback(null,null);
                /!* });*!/
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
        return callback(null,checkinDetails);
    });


};*/

var async = require('async'),
    User = require('../models/user'),
    Port = require('../models/port'),
    CheckOut = require('../models/checkout'),
    CheckIn = require('../models/checkin'),
    CheckoutError = require('../models/checkoutError'),
    CheckInError = require('../models/checkinError'),
    vehicle = require('../models/vehicle');

var MemberService = require('../services/transaction-service');

exports.checkoutApp=function (record,callback) {
    var vehicleDetails;
    var requestDetails;
    var userDetails;
    var portDetails;
    var checkoutDetails;
    var errorstatus=0;
    var errormsg='';
    var details = {user :'',
        vehicleId : '',
        fromPort:'',
        checkOutTime:'',
        status:'',
        errorStatus:0,
        errorMsg:''};

    async.series([
        function (callback) {
            User.findOne({$or: [{'cardNum':record.cardId}, {'smartCardNumber': record.cardId}]},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.user=record.cardId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No user found by this id';
                    details.vehicleId = record.cardId;
                    return callback(null,null);
                }
                userDetails=result;
                details.user=result.UserID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            vehicle.findOne({$or: [{'vehicleNumber':record.vehicleId}, {'vehicleRFID': record.vehicleId}]},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No vehicle found by this id';
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({_id:record.fromPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.fromPort = record.fromPort;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No port found by this id';
                    details.fromPort = record.fromPort;
                    return callback(null,null);
                }
                portDetails = result;
                details.fromPort = result.PortID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if (errorstatus == 0) {
                requestDetails = {
                    user: userDetails._id,
                    vehicleId: vehicleDetails._id,
                    fromPort: portDetails._id,
                    checkOutTime: record.checkOutTime,
                    vehicleUid:vehicleDetails.vehicleUid
                };
                /*MemberService.checkout(requestDetails,function (err,result) {
                 if(err)
                 {
                 errorstatus=1;
                 errormsg=errormsg+':'+err;
                 return callback(null,null);
                 }
                 checkoutDetails= result;
                 return callback(null,result);
                 });*/
                CheckOut.create(requestDetails, function (err, result) {
                    if (err) {
                        errorstatus=1;
                        errormsg=errormsg+':'+err;
                        details.checkOutTime = record.checkOutTime;
                        details.errorStatus = errorstatus;
                        details.errorMsg = errormsg;
                        return callback(null, null);
                    }
                    details.status = result.status;
                    details.checkOutTime = result.checkOutTime;
                    checkoutDetails = result;
                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function(callback) {
            if(errorstatus == 1)
            {
                details.errorStatus=errorstatus;
                details.errorMsg = errormsg;
                CheckoutError.create(details,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    details.status = result.status;
                    details.checkOutTime = result.checkOutTime;
                    checkoutDetails= result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
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

exports.checkinApp = function (record,callback) {
    var vehicleDetails;
    var requestDetails;
    var userDetails;
    var portDetails;
    var checkoutDetails;
    var errorstatus=0;
    var errormsg='';
    var details = {
        vehicleId : '',
        toPort:'',
        checkInTime:'',
        status:'',
        errorStatus:0,
        errorMsg:''};

    async.series([
        function (callback) {
            vehicle.findOne({'vehicleNumber':record.vehicleId},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No vehicle found by this id';
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({_id:record.toPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.toPort = record.toPort;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No port found by this id';
                    details.toPort = record.toPort;
                    return callback(null,null);
                }
                portDetails = result;
                details.toPort = result.PortID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if (errorstatus == 0) {
                requestDetails = {
                    vehicleId: vehicleDetails._id,
                    toPort: portDetails._id,
                    checkInTime: record.checkInTime
                };
                /*MemberService.checkout(requestDetails,function (err,result) {
                 if(err)
                 {
                 errorstatus=1;
                 errormsg=errormsg+':'+err;
                 return callback(null,null);
                 }
                 checkoutDetails= result;
                 return callback(null,result);
                 });*/
                CheckIn.create(requestDetails, function (err, result) {
                    if (err) {
                        errorstatus=1;
                        errormsg=errormsg+':'+err;
                        details.checkInTime = record.checkInTime;
                        details.errorStatus = errorstatus;
                        details.errorMsg = errormsg;
                        return callback(null, null);
                    }
                    details.status = result.status;
                    details.checkInTime = result.checkInTime;
                    checkoutDetails = result;
                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function(callback) {
            if(errorstatus == 1)
            {
                details.errorStatus=errorstatus;
                details.errorMsg = errormsg;
                CheckInError.create(details,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    details.status = result.status;
                    details.checkInTime = result.checkInTime;
                    checkoutDetails= result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }

        }
        /*,
         function (callback) {

         /!*Checkout.findOne(checkoutDetails).deepPopulate('user vehicleId fromPort').lean().exec(function (err, result) {
         if (err) {
         return callback(err, null);
         }*!/
         details.checkOutTime=checkoutDetails.checkOutTime;
         details.status=checkoutDetails.status;
         details.errorStatus = checkoutDetails.errorStatus;
         details.errorMsg = checkoutDetails.errorMsg+" : "+errormsg;
         return callback(null, null);
         /!* });*!/

         }*/
    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,details);
    });
};
