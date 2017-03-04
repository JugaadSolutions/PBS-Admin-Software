/**
 * Created by root on 8/10/16.
 */
var async = require('async'),
    Station = require('../models/station'),
    FarePlan = require('../models/fare-plan');


exports.calculateFarePlan = function (id, duration, callback) {

    var fee;

    FarePlan.findById(id, function (err, result) {

        if (err) {
            return console.error('Calculate Fare plan error : '+err);
        }

        fee = 250;
        for (var i = 0; i < result.plans.length; i++) {

            if (duration <= result.plans[i].endTime) {
                fee = result.plans[i].fee;
                break;
            }

        }
        return callback(null, fee);
    });

};

exports.createFareplan = function (record,callback) {
    var fareplanDetails;
    async.series([
        function (callback) {
            FarePlan.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                fareplanDetails = result;
                return callback(null,result);
            });
        },function (callback) {
            Station.find({stationType:'dock-station'},function (err,result) {
                if(err)
                {
                    console.log('Error fetching station');
                }
                if(result.length>0)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        fareplanDetails.unsuccessIp.push(result[i].ipAddress);
                    }
                    FarePlan.findByIdAndUpdate(fareplanDetails._id, fareplanDetails, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        fareplanDetails = result;
                        return callback(null, result);
                    });
                }
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,fareplanDetails);
    });
};

exports.updateFareplan = function (id,record,callback) {

    /*    async.series([
     function (callback) {*/
    Station.find({stationType:'dock-station'},function (err,result) {
        if(err)
        {
            console.log('Error fetching station');
        }
        if(result.length>0)
        {
            record.unsuccessIp=[];
            record.updateCount=0;
            record.successIp=[];
            record.lastModifiedAt = new Date();
            for(var i=0;i<result.length;i++)
            {
                record.unsuccessIp.push(result[i].ipAddress);
            }
            if(isNaN(id))
            {
                FarePlan.findByIdAndUpdate(id, record, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    //membershipDetails = result;
                    return callback(null, result);
                });
            }
            else
            {
                FarePlan.findOneAndUpdate({fareplanUid:id}, record, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    //membershipDetails = result;
                    return callback(null, result);
                });
            }
        }
        else {
            return callback(null,null);
        }

    });
    /*       },
     function (callback) {

     }
     ],function (err,result) {
     if(err)
     {
     return callback(err,null);
     }
     return callback(null,result);
     });*/

};