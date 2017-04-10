/**
 * Created by root on 29/10/16.
 */
var async = require('async'),
    User = require('../models/user'),
    RegistrationCenter = require('../models/registration-center');

exports.createRC=function (record,callback) {

    var regDetails;
    async.series([
        function (callback) {
            if(record.assignedTo)
            {
                if(isNaN(record.assignedTo))
                {
                    return callback(null,null);
                }
                else
                {
                    User.findOne({UserID:record.assignedTo},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("The Assigned user doesn't exist"),null);
                        }
                        record.assignedTo = result._id;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {
            RegistrationCenter.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                regDetails = result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,regDetails);
    });

};

exports.updateRegistrationcenter = function (id,record,callback) {
    var regDetails;
    async.series([
        function (callback) {
            if(record.assignedTo)
            {
                if(isNaN(record.assignedTo))
                {
                    return callback(null,null);
                }
                else
                {
                    User.findOne({UserID:record.assignedTo},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("The Assigned user doesn't exist"),null);
                        }
                        record.assignedTo = result._id;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {
            if(isNaN(id))
            {
                RegistrationCenter.findByIdAndUpdate(id,record,{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    regDetails = result;
                    return callback(null,result);
                });
            }
            else
            {
                RegistrationCenter.findOneAndUpdate({StationID:id},record,{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    regDetails = result;
                    return callback(null,result);
                });
            }
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,regDetails);
    });
};