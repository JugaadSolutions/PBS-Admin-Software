/**
 * Created by root on 6/12/16.
 */
var async = require('async');
var User = require('../models/user');
var vehicle = require('../models/vehicle');
exports.test = function (callback) {

    async.series([
        function (callback) {
            User.findOne({'email':'admin@mytrintrin.com'},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            vehicle.findOne({'vehicleUid':1},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        console.log('In Async callback : '+result );
        return callback(null,result);
    })
};
