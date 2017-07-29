/**
 * Created by root on 16/10/16.
 */

var Messages = require('../core/messages'),
    _ = require('underscore'),
    jwt = require('jsonwebtoken'),
    fs = require('fs'),
    UploadHandler = require('../handlers/upload-handler'),
    uuid = require('node-uuid'),
    config = require('config'),
    async = require('async'),
    swig = require('swig'),
    random = require('node-random'),
    moment = require('moment'),
    CheckIn = require('../models/checkin'),
    CheckOut = require('../models/checkout'),
    PaymentTransaction = require('../models/payment-transactions'),
    TemplatesMessage = require('../../templates/text-messages'),
    EmailNotificationHandler = require('../handlers/email-notification-handler'),
    Member = require('../models/member'),
    Constants = require('../core/constants'),
    Card = require('../models/card'),
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
   /* if(isNumber(int.parse(username)))
    {
        username = Number(username);
    }*/
    User.findOne({$or: [{email: username}, {phoneNumber: username}, {smartCardNumber: username}/*,{cardNum:username}*/]}, function (err, record) {


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
        var Uid = record.UserID;
        var Role = record._type;
        record.comparePassword(password, function (err, isMatch) {

            if (err || !isMatch) {
                var incorrectCredentialsError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
                incorrectCredentialsError.name = "UserError";
                return callback(incorrectCredentialsError, null);
            }

            record.userId = record._id;
            record = _.pick(record, 'email', '_type', 'phoneNumber', 'UserID', 'createdAt','status');



            var TOKEN_EXPIRATION_HOURS = config.get("security.tokenExpiryHours");
            var TOKEN_EXPIRATION_MINUTES = 60 * TOKEN_EXPIRATION_HOURS;
            var TOKEN_EXPIRATION_TIME = 60 * TOKEN_EXPIRATION_MINUTES;

            var token = jwt.sign(record, config.get('security.secret'), {expiresIn: TOKEN_EXPIRATION_TIME});

            var tokenData = {
                token: token,
                expiresIn: TOKEN_EXPIRATION_TIME,
                id:Id,
                uid:Uid,
                role:Role
            };
            User.findByIdAndUpdate(Id,{$set:{token:token}},{new:true},function (err,result) {
                if(err)
                {
                    var noUserError = new Error(Messages.INVALID_USERNAME_OR_PASSWORD);
                    noUserError.name = "UserError";
                    return callback(noUserError, null);
                }
                return callback(null, tokenData);
            });


        });

    });

};

exports.logoutUser = function (token,callback) {
    User.findOne({token:token},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(result)
        {
            User.findByIdAndUpdate(result._id,{$set:{token:"uyfgwyfgwgyuwgeyugt723782378ggfgsdfg7843grgfgsdfg287gr8gfugsfg278tfghsjh"}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,"Logout successful");
            });
        }
        else
        {
            return callback(null,"Session Expired");
        }

    });
};

exports.changePassword = function (userId, updatedData, callback) {

    var newPassword = updatedData.newPassword;
    var currentPassword = updatedData.currentPassword;
    var passValidation=false;
    async.series([
        function (callback) {
            if (!newPassword || !currentPassword) {
                var emptyPasswordError = new Error(Messages.PASSWORD_CANNOT_BE_EMPTY);
                return callback(emptyPasswordError, null);
            }
            else {
                if (updatedData.newPassword.length >= 6) {
                    //if password contains both lower and uppercase characters, increase strength value
                    if (updatedData.newPassword.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
                        //if it has numbers and characters, increase strength value
                        if (updatedData.newPassword.match(/([0-9])/)) {
                            //if it has one special character, increase strength value
                            if (updatedData.newPassword.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
                                if (updatedData.cpassword == updatedData.newPassword) {
                                    passValidation = true;
                                    return callback(null,null);
                                }
                                else {
                                    return callback(new Error("Password and confirm password doesn't match"));
                                }
                            } else {
                                return callback(new Error("Password  doesn't match the policy"));
                            }
                        }
                        else {
                            return callback(new Error("Password  doesn't match the policy"));
                        }
                    }
                    else {
                        return callback(new Error("Password  doesn't match the policy"));
                    }
                }
                else {
                    return callback(new Error("Password doesn't match the policy"));
                }
            }
        },
        function (callback) {
            if(passValidation)
            {
                if(isNaN(userId))
                {
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
                }
                else
                {
                    User.findOne({UserID:userId}, function (err, record) {

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
                }
            }
            else
            {
                return callback(null,null);
            }

        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,true);
    });

};

exports.forgotPassword = function (record, callback) {

    var ResetKey;
    var userObject;

    var email = record.email;
    async.series([

            // Step 1: Method generate new password
            function (callback) {

                random.strings({"length": 12, "number": 1, "upper": true, "digits": true}, function (err, data) {

                    if (err) {
                        return callback(err, null);
                    }
                    if(!data)
                    {
                        return callback(new Error("Couldn't able to generate random key, Please try again"),null);
                    }
                    ResetKey = data;
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

                    record.resetPasswordKey = ResetKey;
                    record.resetPasswordKeyValidity = moment().add(2,'hours');
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
                if(userObject)
                {
                    var data = {
                        profileName: userObject.Name,
                        // ResetKey: ResetKey,
                        //link: config.get('pbsMemberPortal.resetUrl')+ResetKey
                        link:''
                    };
                    if(record.origin)
                    {
                        if(record.origin=="ios")
                        {
                            data.link= config.get('pbsMemberPortal.iosResetUrl')+ResetKey
                        }
                        else
                        {
                            data.link= config.get('pbsMemberPortal.appResetUrl')+ResetKey
                        }
                    }
                    else
                    {
                        data.link= config.get('pbsMemberPortal.resetUrl')+ResetKey;
                    }
                    var htmlString = swig.renderFile('./templates/forgot-password.html', data);

                    var emailMessage = {
                        "subject": Messages.PASSWORD_RESET_REQUEST,
                        "text": EmailNotificationHandler.renderSignUpTemplate(TemplatesMessage.forgotPassword, data),
                        "html": htmlString,
                        "to": [userObject.email]
                    };

                    EmailNotificationHandler.sendMail(emailMessage);

                    return callback(null, null);
                }
                else
                {
                    return callback(null,null);
                }

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

exports.resetPassword = function (record,callback) {
    var user;
    var passValidation=false;
    async.series([
        function (callback) {
            if (record.newPassword.length >= 6)
            {
                //if password contains both lower and uppercase characters, increase strength value
                if (record.newPassword.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
                {
                    //if it has numbers and characters, increase strength value
                    if (record.newPassword.match(/([0-9])/))
                    {
                        //if it has one special character, increase strength value
                        if (record.newPassword.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
                        {
                            if(record.cpassword==record.newPassword)
                            {
                                passValidation=true;
                                return callback(null,null);
                            }
                            else
                            {
                                return callback(new Error("Password and confirm password doesn't match"));
                            }
                        } else {
                            return callback(new Error("Password  doesn't match the policy"));
                        }
                    }
                    else {
                        return callback(new Error("Password  doesn't match the policy"));
                    }
                }
                else {
                    return callback(new Error("Password  doesn't match the policy"));
                }
            }
            else {
                return callback(new Error("Password doesn't match the policy"));
            }
        },
        function (callback) {
            if(passValidation)
            {

                User.findOne({'resetPasswordKey':record.resetkey},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    //user=result;
                    if(!result)
                    {
                        return callback(new Error('Your password reset link is expired'),null);
                    }
                    var durationMin = moment.duration(moment(result.resetPasswordKeyValidity).diff(moment()));
                    var duration = durationMin.asMinutes();
                    if(duration<0)
                    {
                        return callback(new Error('Your password reset validity expired'),null);
                    }
                    user=result;
                    return callback(null,null);
                });

            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(passValidation)
            {

                if(user)
                {
                    user.resetPasswordKey = '';
                    user.emailVerified = true;
                    user.resetPasswordKeyValidity = '';
                    user.password = record.newPassword;
                    user.save(function (err) {

                        if (err) {
                            return callback(err, null);
                        }
                        return callback(null, true);
                    });
                }
                else {
                    return callback(null,null);
                }

            }
            else
            {
                return callback(null,null);
            }
        }

    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,true);
    });
};

exports.clearAllVehicles = function (callback) {

    async.series([
        function (callback) {
            User.update({status:{$ne:0}}, {$set:{vehicleId:[]}}, {multi: true}, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, result);
            });
        },
        function (callback) {
            User.update({status:{$ne:0}}, {$set:{lastSyncedAt:new Date('2017-01-01T00:00:00.000Z')}}, {multi: true}, function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, result);
            });
        },
        function (callback) {
            CheckIn.remove({status:"Open"},function (err,checkinDetail) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,checkinDetail);
            });
        },
        function (callback) {
            CheckOut.remove({status:"Open"},function (err,checkoutDetail) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,checkoutDetail);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.searchUser = function (record,callback) {
    var findMem = record.name;
    if(findMem)
    {
        if(findMem!='')
        {
            if(isNaN(findMem))
            {
                User.find({$or: [{Name: new RegExp(findMem, 'i')}, {email: new RegExp(findMem, 'i')},{lastName:new RegExp(findMem, 'i')},{phoneNumber:new RegExp(findMem, 'i')},{smartCardNumber: new RegExp(findMem, 'i')}]},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            }
            else
            {
                User.find({cardNum:findMem},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            }
        }
        else
        {
            return callback(new Error('No text found to search'),null);
        }
    }
    else
    {
        return callback(new Error('No text found to search'),null);
    }

};

exports.updateOndemand = function (record,callback) {

    //var documents = [];
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
    async.series([
        function (callback) {

            if (record.profilePic) {

                var dir = '/usr/share/nginx/html/mytrintrin/Member/'+record.UserID+"/";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                var docNumber = record.UserID + uuid.v4();
                var docFilePath = dir+ docNumber+".png";
                if(record.profilePic.result) {
                    var decodedDoc = new Buffer(record.profilePic.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                    var fileDetails = {
                        key: '/usr/share/nginx/html/mytrintrin/Member/' + record.UserID + '/ ' + docNumber + '.png',
                        filePath: docFilePath
                    };

                    // Method to write Multiple files
                    var writeFiles = {
                        filePath: docFilePath,
                        file: decodedDoc,
                        fileName: docNumber
                    };

                    filesArrayToWrite.push(writeFiles);
                    filesArray.push(fileDetails);

                    record.profilePic = docNumber;
                }
                return callback(null, null);

            } else {
                return callback(null, null);
            }

        },
        function (callback) {

            if (record.memberprofilePic) {

                var dir = '/usr/share/nginx/html/mytrintrin/Member/'+record.UserID+"/";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                var docNumber = record.UserID + uuid.v4();
                var docFilePath = dir+ docNumber+".png";
                if(record.memberprofilePic.result) {
                    var decodedDoc = new Buffer(record.memberprofilePic.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                    var fileDetails = {
                        key: '/usr/share/nginx/html/mytrintrin/Member/' + record.UserID + '/ ' + docNumber + '.png',
                        filePath: docFilePath
                    };

                    // Method to write Multiple files
                    var writeFiles = {
                        filePath: docFilePath,
                        file: decodedDoc,
                        fileName: docNumber
                    };

                    filesArrayToWrite.push(writeFiles);
                    filesArray.push(fileDetails);

                    record.memberprofilePic = docNumber;
                }
                return callback(null, null);

            } else {
                return callback(null, null);
            }

        },
        function (callback) {
            if (record.documents) {

                for (var i = 0; i < record.documents.length; i++) {

                    var dir = '/usr/share/nginx/html/mytrintrin/Member/'+record.UserID+"/";

                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                    var docNumber = i + uuid.v4();
                    var docFilePath = dir+ docNumber+".png";

                    // Check if there is a new document available
                    if (record.documents[i].documentCopy.result) {

                        var decodedDoc = new Buffer(record.documents[i].documentCopy.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                        /*var fileDetails = {
                         key: config.get('aws.bucket') + config.get('awsFolders.member') + memberObject.memberId + '/' + docNumber + '.png',
                         filePath: docFilePath
                         };*/
                        var fileDetails = {
                            key: '/usr/share/nginx/html/mytrintrin/Member/' + record.UserID + '/ ' + docNumber + '.png',
                            filePath: docFilePath
                        };

                        // Method to write Multiple files
                        var writeFiles = {
                            filePath: docFilePath,
                            file: decodedDoc,
                            fileName: docNumber
                        };

                        filesArrayToWrite.push(writeFiles);
                        filesArray.push(fileDetails);

                        record.documents[i].documentCopy = docNumber;

                    }

                    // removing document name if type not Other
                    if (record.documents[i].documentType != "Other") {
                        record.documents[i].documentName = "";
                    }

                    //filesToDelete.push(docFilePath);
                }

                return callback(null, null);
            } else {
                return callback(null, null);
            }
        },
        function (callback) {

            if (filesArrayToWrite.length > 0) {

                UploadHandler.writeFile(filesArrayToWrite, function (err) {

                    if (err) {
                        return callback(err, null);
                    }

                    return callback(null, null);
                });

            } else {
                return callback(null, null);
            }

        },

        function (callback) {

            var docArray = [];

            /*Member.findById(memberDetails._id, function (err, result) {

             if (err) {
             return callback(err, null);
             }*/

            if (record.documents) {

                for (var i = 0; i < record.documents.length; i++) {

                    var docDetails = {
                        documentType: record.documents[i].documentType,
                        documentNumber: record.documents[i].documentNumber,
                        documentCopy: record.documents[i].documentCopy,
                        documentName: record.documents[i].documentName,
                        description: record.documents[i].description
                    };

                    docArray.push(docDetails);
                }
            }

            /*                if (record.profilePic) {
             record.picture = record.profilePic;
             }*/
            record.documents = docArray;
            memberDetails=record;
            Member.findOne({UserID:record.UserID},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.USER_NOT_FOUND),null);
                }
                record._id = result._id;
                var memData = {
                    Name:record.Name,
                    lastName:record.lastName,
                    profilePic:record.profilePic,
                    documents:record.documents,
                    status:1,
                    age:record.age,
                    pinCode:record.pinCode,
                    education:record.education,
                    occupation:record.occupation,
                    emergencyContact:record.emergencyContact,
                    sex:record.sex,
                    address:record.address,
                    city:record.city,
                    state:record.state,
                    countryCode:record.countryCode,
                    country:record.country,
                    validity:moment().add(record.noofDays,'days')
                };

                if(record.email)
                {
                    memData.email=record.email;
                }
                if(record.phoneNumber)
                {
                    memData.phoneNumber=record.phoneNumber;
                }
                Member.update({_id:record._id}, memData, {new: true}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    //memberDetails = result;
                    return callback(null, result);
                });
            });


            //});
        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,memberDetails);
    });


};

exports.ondemandcreater = function () {
   var members = [];
    var cards;
    var allmems;
    async.series([
        function (callback) {
            Card.find({status:Constants.CardStatus.AVAILABLE,cardType:Constants.CardType.ONDEMAND},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result.length==0)
                {
                    return callback(new Error("No ondemand cards found"),null);
                }
                cards = result;
                return callback(null,result);
            });
        },
       function (callback) {
           for(var i = 0;i<cards.length;i++)
           {
               var mem = {
                   Name:"member"+i+1,
                   email:"member"+i+"-"+cards[i].cardNumber+"@email.com",
                   password:"User@123",
                   emailVerified:true,
                   phoneNumber:"91-000000"+cards[i].cardNumber,
                   age:25,
                   sex:"Male",
                   countryCode:91,
                   membershipId:"590042bd3731f83649175f60",
                   creditBalance:50,
                   ondemand:true,
                   cardNum:cards[i].cardNumber,
                   smartCardNumber:cards[i].cardRFID,
                   smartCardId:cards[i]._id,
                   validity:moment().add(3,'days')
               };
               members.push(mem);
               if(i==cards.length-1)
               {
                   return callback(null,null);
               }
           }
       },
        function (callback) {
            Member.create(members,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                allmems =result;
                return callback(null,result);
            });
        },
        function (callback) {
            async.forEach(allmems,function (member) {
                Card.update({cardNumber:member.cardNum},{$set:{status:Constants.CardStatus.ASSIGNED,assignedTo:member._id}}).exec();
            },function (err) {
               console.error(err);
            });
            return callback(null,null);
        }
   ],function (err,result) {
       if(err)
       {
         return console.error(err);
       }
       return console.log(result);
   }) ;
};

exports.detailedCount = function (callback) {
    var data={};
    var day = new Date();
    day.setDate(4);
    day.setMonth(6);
    day.setYear(2017);
    var d = moment(day).format('YYYY-MM-DD');
    async.series([
        function (callback) {
            User.count({createdAt:{$gte:moment(d)},sex:"Male"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                data.Male = result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.count({createdAt:{$gte:moment(d)},sex:"Female"},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                data.Female = result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.count({createdAt:{$gte:moment(d)},_type:"member",status:{$ne:0},age:{$lt:20}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                data.lessthan20 = result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.count({createdAt:{$gte:moment(d)},_type:"member",status:{$ne:0},age:{$gte:20,$lt:30}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                data.gte20lt30 = result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.count({createdAt:{$gte:moment(d)},_type:"member",status:{$ne:0},age:{$gte:30,$lt:40}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                data.gte30lt40 = result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.count({createdAt:{$gte:moment(d)},_type:"member",status:{$ne:0},age:{$gte:40,$lt:50}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                data.gte40lt50 = result;
                return callback(null,result);
            });
        },
        function (callback) {
            User.count({createdAt:{$gte:moment(d)},_type:"member",status:{$ne:0},age:{$gte:50}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                data.greaterthan50 = result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,data);
    });
};

exports.changeOndemand = function (record,callback) {
    var userDet;
    async.series([
        function (callback) {
            User.findOne({cardNum:record.cardNum},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error('No user found by this card number'),null);
                }
                userDet = result;
                return callback(null,result);
            });
        },
        function (callback) {
            PaymentTransaction.update({memberId:userDet._id},{$set:{createdAt:moment(),location:record.location}},{multi:true},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        },
        function (callback) {
            PaymentTransaction.findOne({credit:350,memberId:userDet._id},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error('User transaction not found'),null);
                }
                PaymentTransaction.findByIdAndUpdate(result._id,{$set:{paymentDescription:"Registration",paymentMode:"Cash",paymentThrough:"Cash"}},{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    PaymentTransaction.findOneAndUpdate({memberId:userDet._id,debit:250},{$set:{paymentDescription:"Security Deposit",paymentMode:"Transfer",paymentThrough:"Transfer"}},{new:true},function (err) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        });
                    return callback(null,result);
                });

            });
        },
        function (callback) {
            var val = moment().add(30,'days');
            Member.findByIdAndUpdate(userDet._id,{$set:{createdAt:moment(),creditBalance:50,validity:val}},{new:true},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                userDet = result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,userDet);
    });
};