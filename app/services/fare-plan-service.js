/**
 * Created by root on 8/10/16.
 */
// Third Party Dependencies
/*var fs = require('fs'),
    async = require('async'),
    uuid = require('node-uuid'),
    request = require('request'),
    config = require('config');*/

// Application Level Dependencies
var FarePlan = require('../models/fare-plan');

// Method to calculate fare plan
exports.calculateFarePlan = function (id, duration, callback) {

    var fee;

    FarePlan.findById(id, function (err, result) {

        if (err) {
            return callback(err, null);
        }

        for (var i = 0; i < result.plans.length; i++) {

            if (duration >= result.plans[i].startTime && duration <= result.plans[i].endTime) {
                fee = result.plans[i].fee;
            }

        }

        if (!fee && fee != 0) {
            fee = result.plans[result.plans.length - 1].fee;
        }

        return callback(null, fee);
    });

};