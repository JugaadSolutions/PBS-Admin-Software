/**
 * Created by root on 30/6/17.
 */
var async = require('async'),
    KoneCenter = require('../models/karnatakaone-center'),
    User = require('../models/user');

/*exports.exports.createRKOneC=function (record,callback) {

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
            KoneCenter.create(record,function (err,result) {
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

}*/;

exports.updateKonecenter = function (id,record,callback) {
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
                KoneCenter.findByIdAndUpdate(id,record,{new:true},function (err,result) {
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
                KoneCenter.findOneAndUpdate({StationID:id},record,{new:true},function (err,result) {
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
