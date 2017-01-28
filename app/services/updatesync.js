/**
 * Created by root on 12/1/17.
 */

/*
var async = require('async'),
    RequestService = require('../services/request-service'),
    User = require('../models/user'),
    DockStation = require('../models/dock-station');

exports.updatesync = function (user,callback) {

    var DSCount=0;
    async.series([
        function (callback) {
            DockStation.find({'stationType':'dock-station'},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                DSCount=result;
                console.log('DS count : '+DSCount);
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    })
};
*/
