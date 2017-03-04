/**
 * Created by root on 29/10/16.
 */
var RegistrationCenter = require('../models/registration-center');

exports.createRC=function (record,callback) {
    RegistrationCenter.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateRegistrationcenter = function (id,record,callback) {
    if(isNaN(id))
    {
        RegistrationCenter.findByIdAndUpdate(id,record,{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
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
            return callback(null,result);
        });
    }
};