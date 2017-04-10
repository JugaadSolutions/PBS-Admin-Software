/**
 * Created by root on 4/3/17.
 */
var async = require('async'),
    Station = require('../models/station'),
    User = require('../models/user'),
    Topup = require('../models/topup-plan');

exports.createTopup = function (record,callback) {
    var topupDetails;
    async.series([
        function (callback) {
            if(record.createdBy)
            {
                User.findOne({UserID:record.createdBy},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback("Logged in user id missing",null);
                    }
                    record.createdBy= result._id;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            Topup.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                topupDetails=result;
                return callback(null,result);
            });
        },
        function (callback) {
            Station.find({stationType:'dock-station'},function (err,result) {
                if(err)
                {
                    console.log('Error fetching station');
                }
                if(result.length>0)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        topupDetails.unsuccessIp.push(result[i].ipAddress);
                    }
                    Topup.findByIdAndUpdate(topupDetails._id, topupDetails, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        topupDetails = result;
                        return callback(null, result);
                    });
                } else
                {
                    return callback(null,null);
                }
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,topupDetails);
    });
};

exports.updateTopup = function (id,record,callback) {


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
                Topup.findByIdAndUpdate(id, record, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    //membershipDetails = result;
                    return callback(null, result);
                });
            }
            else
            {
                Topup.findOneAndUpdate({topupId:id}, record, {new: true}, function (err, result) {

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

};



