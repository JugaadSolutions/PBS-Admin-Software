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
    RegistrationCenter.findByIdAndUpdate(id,record,{new:true},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};