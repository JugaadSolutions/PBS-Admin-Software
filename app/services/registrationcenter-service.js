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