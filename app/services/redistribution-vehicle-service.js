/**
 * Created by root on 6/10/16.
 */
// Third Party Dependencies
var async = require('async')
    /*config = require('config'),
     request = require('request')*/;
var RedistributionVehicle=require('../models/redistribution-vehicle');



exports.createDS = function (record,callback) {

    RedistributionVehicle.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};
