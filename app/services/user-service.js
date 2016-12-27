/**
 * Created by root on 16/10/16.
 */

var Messages = require('../core/messages'),
    _ = require('underscore'),
    jwt = require('jsonwebtoken'),
    config = require('config'),
    async = require('async'),
    swig = require('swig'),
    random = require('node-random'),
    TemplatesMessage = require('../../templates/text-messages'),
    EmailNotificationHandler = require('../handlers/email-notification-handler'),
    User = require('../models/user');

exports.loginUser = function (loginData, callback) {

    var username = loginData.username;
    var password = loginData.password;

    if (!username || !password) {
        var invalidInputError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
        invalidInputError.name = "UserError";
        return callback(invalidInputError, null);
    }
    /*    if(username!='admin@mytrintrin.com') {
     Member.findOne({emailAddress: username}, function (err, data) {
     if (err) {
     return memId = '';
     }
     memId = data._id;
     });
     }*/
    User.findOne({$or: [{phoneNumber: username}, {email: username}, {smartCardNumber: username}]}, function (err, record) {


        if (err) {
            return callback(err, null);
        }

        if (!record) {
            var noUserError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
            noUserError.name = "UserError";
            return callback(noUserError, null);
        }

        if (!record.emailVerified) {
            return callback(new Error(Messages.YOUR_EMAIL_IS_NOT_YET_VERIFIED_PLEASE_VERIFY_BEFORE_LOGGING_IN), null);
        }

        var Id = record._id;
        var Role = record._type;
        record.comparePassword(password, function (err, isMatch) {

            if (err || !isMatch) {
                var incorrectCredentialsError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
                incorrectCredentialsError.name = "UserError";
                return callback(incorrectCredentialsError, null);
            }

            record.userId = record._id;
            record = _.pick(record, 'email', '_type', 'phoneNumber', 'userID', 'createdAt');



            var TOKEN_EXPIRATION_HOURS = config.get("security.tokenExpiryHours");
            var TOKEN_EXPIRATION_MINUTES = 60 * TOKEN_EXPIRATION_HOURS;
            var TOKEN_EXPIRATION_TIME = 60 * TOKEN_EXPIRATION_MINUTES;

            var token = jwt.sign(record, config.get('security.secret'), {expiresIn: TOKEN_EXPIRATION_TIME});

            var tokenData = {
                token: token,
                expiresIn: TOKEN_EXPIRATION_TIME,
                id:Id,
                role:Role
            };

            return callback(null, tokenData);

        });

    });

};

exports.changePassword = function (userId, updatedData, callback) {

    var newPassword = updatedData.newPassword;
    var currentPassword = updatedData.currentPassword;

    if (!newPassword || !currentPassword) {
        var emptyPasswordError = new Error(Messages.PASSWORD_CANNOT_BE_EMPTY);
        return callback(emptyPasswordError, null);
    }

    User.findOne({'_id':userId}, function (err, record) {

        if (err) {
            return callback(err, null);
        }

        if (!record) {
            var recordNotFoundError = new Error(Messages.NO_MEMBER_FOUND);
            return callback(recordNotFoundError, null);
        }

        record.comparePassword(currentPassword, function (err, isMatch) {

            if (err) {
                return callback(err, null);
            }

            if (!isMatch) {
                var passwordsNoMatchError = new Error(Messages.PLEASE_ENTER_THE_CORRECT_CURRENT_PASSWORD);
                return callback(passwordsNoMatchError, null);
            }

            record.password = newPassword;

            record.save(function (err) {

                if (err) {
                    return callback(err, null);
                }

                return callback(null, true);

            });

        });

    });

};

exports.forgotPassword = function (email, callback) {

    var password;
    var userObject;

    async.series([

            // Step 1: Method generate new password
            function (callback) {

                random.strings({"length": 6, "number": 1, "upper": true, "digits": true}, function (err, data) {

                    if (err) {
                        return callback(err, null);
                    }

                    password = data;
                    return callback(null, data);
                });

            },

            // Step 2: Method to update user
            function (callback) {

                User.findOne({$or: [{phoneNumber: email}, {email: email}]}, function (err, record) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!record) {
                        var noUserError = new Error(Messages.NO_USER_EXISTS_WITH_THIS_INFO);
                        noUserError.name = "UserError";
                        return callback(noUserError, null);
                    }

                    record.password = password;
                    userObject = record;

                    record.save(function (err) {

                        if (err) {
                            return callback(err, null);
                        }

                        return callback(null, true);

                    });

                });

            },

            // Step 3: Method to email user their new password
            function (callback) {

                var data = {
                    profileName: userObject.Name,
                    password: password,
                    link: config.get('pbsMemberPortal.url')
                };

                var htmlString = swig.renderFile('./templates/forgot-password.html', data);

                var emailMessage = {
                    "subject": Messages.YOUR_PASSWORD_HAS_BEEN_RESET_SUCCESSFULLY,
                    "text": EmailNotificationHandler.renderSignUpTemplate(TemplatesMessage.forgotPassword, data),
                    "html": htmlString,
                    "to": [userObject.email]
                };

                EmailNotificationHandler.sendMail(emailMessage);

                return callback(null, null);
            }

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, 'Password changed successfully');

        }
    );

};
