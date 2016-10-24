/**
 * Created by root on 8/10/16.
 */
var FarePlan = require('../models/fare-plan');


exports.calculateFarePlan = function (id, duration, callback) {

    var fee;

    FarePlan.findById(id, function (err, result) {

        if (err) {
            return callback(err, null);
        }

        fee = result.plans[0].fee;
        for (var i = 0; i < result.plans.length; i++) {

            if (duration >= result.plans[i].endTime) {
                fee = result.plans[i].fee;
            }

        }
        return callback(null, fee);
    });

};