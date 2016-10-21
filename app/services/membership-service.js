var async = require("async");

// Application Level Dependencies
var Membership = require('../models/membership'),
    Member = require('../models/member'),

    Messages = require('../core/messages');

exports.calculateValidity = function (membershipId, memberId, callback) {

    var calculateMembership = false;

    var validity;

    async.series([

            function (callback) {

                Member.findById(memberId, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    if (!result.processingFeesDetected) {
                        calculateMembership = true;
                    } else {
                        validity = result.validity;
                        return callback(null, validity);
                    }

                    return callback(null, result);
                });

            },

            // Step 1: Method to verify card and update
            function (callback) {

                if (calculateMembership) {

                    Membership.findById(membershipId, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        if (!result) {
                            return callback(new Error(Messages.NO_MEMBERSHIP_FOUND), null);
                        }

                        var currentDate = new Date();
                        currentDate.setDate(currentDate.getDate() + result.validity);
                        validity = currentDate;

                        return callback(null, validity);

                    });

                } else {
                    return callback(null, null);
                }
            }

        ],

        function (err) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, validity);

        }
    );

};