var Member = require('../models/member'),
    fs = require('fs'),
    UploadHandler = require('../handlers/upload-handler'),
    OtpHandler = require('../handlers/OTP-request-handler'),
    uuid = require('node-uuid'),
    random = require("node-random"),
    swig = require('swig'),
    async=require('async'),
    config = require('config'),
    moment = require('moment'),
    MembershipService=require('../services/membership-service'),
    PaymentTransaction=require('../services/payment-transaction'),
    CardService = require('../services/card-service'),
    Messages = require('../core/messages'),
    Constants =require('../core/constants'),
    Membership = require('../models/membership'),
    PoolAccount = require('../models/poolingaccount'),
    TemplatesMessage = require('../../templates/text-messages'),
    EmailNotificationHandler = require('../handlers/email-notification-handler'),
    Payments = require('../models/payment-transactions'),
    RegCenter = require('../models/registration-center'),
    Card = require('../models/card'),
    CardTrack = require('../models/card-track'),
    Station = require('../models/station'),
    //CardService = require('../services/card-service'),
    Topup = require('../models/topup-plan'),
    User=require('../models/user');

exports.createMember=function (record,callback) {

    /*   var memberData={
     name:record.Name,
     phoneNumber
     address
     city
     country
     };
     */
    var documents = [];
    var profilePic = {};
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
    var password;
    var ResetKey;
    var passwordFlag = 0;
    var passValidation=false;

    async.series([
        /*     function (callback) {

         if (record.password) {
         password = record.password;
         return callback(null, null);
         } else {
         random.strings({"length": 6, "number": 1, "upper": true, "digits": true}, function (err, data) {

         if (err) {
         return callback(err, null);
         }

         password = data;
         return callback(null, data);
         });
         }

         }*/
        function (callback) {

            if (record.password) {
                password = record.password;
                record.emailVerified=true;
                if (password.length >= 6)
                {
                    //if password contains both lower and uppercase characters, increase strength value
                    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
                    {
                        //if it has numbers and characters, increase strength value
                        if (password.match(/([0-9])/))
                        {
                            //if it has one special character, increase strength value
                            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
                            {
                                if(record.cpassword==password)
                                {
                                    return callback(null,true);
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
                passwordFlag = 1;
                return callback(null, null);
            } else {
                random.strings({"length": 12, "number": 1, "upper": true, "digits": true}, function (err, data) {

                    if (err) {
                        return callback(err, null);
                    }
                    //password=data.split('').reverse().join('');
                    ResetKey = data;
                    return callback(null, data);
                });
            }

        }    ,
        function (callback) {
            if (record.createdBy) {
                if(isNaN(record.createdBy))
                {
                    return callback(null,null);
                }
                else
                {
                    User.findOne({UserID:record.createdBy},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(result)
                        {
                            record.createdBy = result._id;
                            return callback(null,result);
                        }
                        else
                        {
                            return callback(null,null);
                        }
                    });
                }
            }
            else {
                return callback(null, null);
            }
        }
        ,
        function (callback) {
            documents = record.documents;
            profilePic = record.profilePic;
            record.documents = [];
            record.profilePic = '';
            //record.password=password;
            Member.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    memberDetails=result;
                    return callback(null,result);
                }
                else
                {
                    return callback(null,null);
                }

            });
        },
        function (callback) {

            if (profilePic) {

                var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails.UserID+"/";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                var docNumber =memberDetails.UserID+ uuid.v4();
                var docFilePath = dir+ docNumber+".png";
                if(profilePic.result) {
                    var decodedDoc = new Buffer(profilePic.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                    var fileDetails = {
                        key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails.UserID + '/ ' + docNumber + '.png',
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
                    memberDetails.profilePic = docNumber;
                }
                return callback(null, null);

            } else {
                return callback(null, null);
            }

        },
        function (callback) {

            if (record.memberprofilePic) {

                var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails.UserID+"/";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                var docNumber =memberDetails.UserID+ uuid.v4();
                var docFilePath = dir+ docNumber+".png";
                if(record.memberprofilePic.result) {
                    var decodedDoc = new Buffer(record.memberprofilePic.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                    var fileDetails = {
                        key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails.UserID + '/ ' + docNumber + '.png',
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
                //memberDetails.memberprofilePic = docNumber;
                return callback(null, null);

            } else {
                return callback(null, null);
            }

        }
        ,
        function (callback) {
            if (documents) {

                for (var i = 0; i < documents.length; i++) {

                    var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails.UserID+"/";

                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                    var docNumber = i + uuid.v4();
                    var docFilePath = dir+ docNumber+".png";

                    // Check if there is a new document available
                    if (documents[i].documentCopy.result) {

                        var decodedDoc = new Buffer(documents[i].documentCopy.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                        /*var fileDetails = {
                         key: config.get('aws.bucket') + config.get('awsFolders.member') + memberObject.memberId + '/' + docNumber + '.png',
                         filePath: docFilePath
                         };*/
                        var fileDetails = {
                            key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails.UserID + '/ ' + docNumber + '.png',
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

                        documents[i].documentCopy = docNumber;

                    }

                    // removing document name if type not Other
                    if (documents[i].documentType != "Other") {
                        documents[i].documentName = "";
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

            if(memberDetails._id)
            {
                Member.findById(memberDetails._id, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    if(result) {
                        if (documents) {

                            for (var i = 0; i < documents.length; i++) {

                                var docDetails = {
                                    documentType: documents[i].documentType,
                                    documentNumber: documents[i].documentNumber,
                                    documentCopy: documents[i].documentCopy,
                                    documentName: documents[i].documentName,
                                    description: documents[i].description
                                };

                                docArray.push(docDetails);
                            }
                        }

                        /*             if (record.profilePic) {
                         result.picture = record.profilePic;
                         }*/
                        result.documents = docArray;
                        result.resetPasswordKey = ResetKey;
                        result.resetPasswordKeyValidity = moment().add(2, 'hours');
                        result.profilePic = record.profilePic;
                        //Member.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                        if(result._id)
                        {
                            Member.update({_id: result._id}, result, {new: true}).lean().exec(function (err, result) {
                                if (err) {
                                    return callback(err, null);
                                }
                                if(!result)
                                {
                                        return callback(new Error("Coundn't able to update profile pic and documents"),null);
                                }
                                return callback(null, result);
                            });
                        }
                        else
                        {
                            return callback(null,null);
                        }

                    }
                    else
                    {
                        return callback(null,null);
                    }
                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {

            if(memberDetails.email!=null && memberDetails.email!='' && memberDetails.email!='undefined')
            {
                if(passwordFlag==1)
                {
                    var data = {
                        profileName: memberDetails.Name,
                        //password: password,
                        link: config.get('pbsMemberPortal.url')
                    };

                    var htmlString = swig.renderFile('./templates/member-registered-with-password.html', data);

                    var emailMessage = {
                        "subject": Messages.SIGN_UP_SUCCESSFUL,
                        "text": EmailNotificationHandler.renderSignUpTemplate(TemplatesMessage.signUp, data),
                        "html": htmlString,
                        "to": [memberDetails.email]
                    };

                    EmailNotificationHandler.sendMail(emailMessage);
                }
                else
                {
                    var data = {
                        profileName: memberDetails.Name,
                        //password: password,
                        link: config.get('pbsMemberPortal.resetUrl')+ResetKey
                    };

                    var htmlString = swig.renderFile('./templates/member-registered.html', data);

                    var emailMessage = {
                        "subject": Messages.SIGN_UP_SUCCESSFUL,
                        "text": EmailNotificationHandler.renderSignUpTemplate(TemplatesMessage.signUp, data),
                        "html": htmlString,
                        "to": [memberDetails.email]
                    };

                    EmailNotificationHandler.sendMail(emailMessage);
                }

                return callback(null, null);
            }
            else
            {
                return callback(null,null);
            }

        }/*,
         function (callback) {
         Station.find({stationType:'dock-station'},function (err,result) {
         if(err)
         {
         console.log('Error fetching station');
         }
         if(result.length>0)
         {
         for(var i=0;i<result.length;i++)
         {
         memberDetails.unsuccessIp.push(result[i].ipAddress);
         }
         Member.findByIdAndUpdate(memberDetails._id, memberDetails, {new: true}, function (err, result) {
         //Member.update({_id:memberDetails._id}, memberDetails, {new: true}).lean().exec(function (err, result) {
         if (err) {
         return callback(err, null);
         }

         memberDetails = result;
         return callback(null, result);
         });
         }
         });

         }*/


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,memberDetails);
    });

};


exports.updateMember = function (record,callback) {

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
                Member.update({_id:record._id}, record, {new: true}).lean().exec(function (err, result) {

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

exports.assignMembership=assignMemberShip;
function assignMemberShip (memberId, membershipId,callback) {

    // var validity;
    var memberObject;
    var paymentObject;
    var membershipDetails;
    var memberDetails;
    var signedup = false;
    async.series([

            /* // Step 1: Method to calculate balance and validity
             function (callback) {

             MembershipService.calculateValidity(membershipId, memberId, function (err, result) {

             if (err) {
             return callback(err, null);
             }

             validity = result;
             return callback(null, result);
             });
             },*/

            function (callback) {
                if(isNaN(memberId))
                {
                    return callback(null,null);
                }
                else
                {
                    User.findOne({UserID:memberId},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("Couldn't able to find user to assign to membership"),null);
                        }
                        memberId = result._id;
                        return callback(null,result);
                    });
                }
            },
            function (callback) {
                if(isNaN(membershipId))
                {
                    return callback(null,null);
                }
                else
                {
                    Membership.findOne({membershipId:membershipId},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(result)
                        {
                            membershipId = result._id;
                            membershipDetails = result;
                            return callback(null,result);
                        }
                        else
                        {
                            return callback(null,null);
                        }

                    });
                }
            },

            function (callback) {
                if(isNaN(membershipId))
                {
                    Member.findByIdAndUpdate(memberId, {
                        $set: {
                            //'validity': validity,
                            'membershipId': membershipId,
                            'status':Constants.MemberStatus.REGISTERED
                        }
                    },{new:true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }
                        memberObject = result;
                        return callback(null, result);

                    });
                }
                else
                {
                    return callback(null,null);
                }

            },
            function (callback) {
                if(Number(memberObject.creditBalance)>0 && memberObject.processingFeesDeducted==false) {
                    Payments.findOne({'memberId':memberObject._id,'paymentDescription':'Registration'},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        paymentObject=result;
                        return callback(null,result);
                    });
                }
                else
                {
                    return callback(null,null);
                }
            }

            ,
            function (callback) {
                if(Number(memberObject.creditBalance)>0 && memberObject.processingFeesDeducted==false)
                {
                    if(paymentObject)
                    {

                        var rec = {
                            transactionNumber:paymentObject.gatewayTransactionId,
                            comments:paymentObject.comments,
                            credit:paymentObject.credit,
                            creditMode:paymentObject.paymentMode,
                            createdBy:memberObject.createdBy
                        };
                        signedup = true;
                        PaymentTransaction.signedUp(rec,memberObject,function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }

                            return callback(null,result);
                        });
                    }
                    else
                    {
                        return callback(new Error('Could not able to find your transaction details '),null);
                    }

                }
                else
                {
                    return callback(null,null);
                }
            }/*,
             function (callback) {
             if(signedup)
             {
             return callback(null,null);
             }
             else
             {
             var data = {
             creditMode:record.creditMode,
             transactionNumber:record.transactionNumber,
             comments:record.comments,
             credit:Number(membershipDetails.userFees+membershipDetails.securityDeposit+memberObject.processingFees+memberObject.smartCardFees)
             };
             addCreditToMember(memberId,data,function (err,result) {
             if(err)
             {
             return callback
             }
             });
             }

             }*/

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, result);

        }
    );

}

exports.addCard = assignCard;
function assignCard(memberId, cardNumber, membershipId,createdBy, callback) {

    var cardObject;
    var memberObject;
    var balance=0;
    var memberName;
    var validity;
    var before;

    async.series([
            // Step 1: Method to check for any assigned cards
            function (callback) {

                if(isNaN(memberId))
                {
                    User.findById(memberId, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        if (!result) {
                            return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                        }
                        if(result._type=='member')
                        {
                            balance = result.creditBalance;
                        }
                        memberName = result.Name;
                        /*                    if (result.cardNum) {

                         CardService.deactivateCard(result.cardNum, function (err, result) {

                         if (err) {
                         return callback(null, null);
                         }

                         return callback(null, result);
                         });

                         } else {*/
                        return callback(null, null);
                        // }
                    });

                }
                else
                {
                    User.findOne({UserID:memberId}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        if (!result) {
                            return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                        }
                        if(result._type=='member')
                        {
                            balance = result.creditBalance;
                        }
                        memberName = result.Name;
                        memberId = result._id;
                        /*                    if (result.cardNum) {

                         CardService.deactivateCard(result.cardNum, function (err, result) {

                         if (err) {
                         return callback(null, null);
                         }

                         return callback(null, result);
                         });

                         } else {*/
                        return callback(null, null);
                        // }
                    });

                }

            },

            // Step 2: Method to verify and update card
            function (callback) {

                CardService.cardAvailableForMember(cardNumber, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    before = result.status;
                    result.status = Constants.CardStatus.ASSIGNED;
                    result.membershipId = membershipId;
                    result.assignedTo = memberId;
                    result.assignedToName = memberName;
                    result.balance= (balance>0)?balance:0;
                    result.issuedBy=createdBy;
                    result.issuedDate = new Date();

                    Card.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }
                        cardObject = result;
                        var data = {
                            assignedUserId:result.assignedTo,
                            preStatus:before,
                            postStatus:result.status,
                            cardId:result._id,
                            changerId:createdBy
                        };
                        CardTrack.create(data,function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            return callback(null,result);
                        });
                    });

                });
            },
            function (callback) {

                MembershipService.calculateValidity(membershipId, memberId, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    validity = result;
                    return callback(null, result);
                });

            }
            ,
            // Step 3: Method to update member card details
            function (callback) {
                Member.findById(memberId,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    result.validity=validity;
                    result.cardNum = cardObject.cardNumber;
                    result.smartCardId=cardObject._id;
                    result.smartCardNumber=cardObject.cardRFID;
                    memberObject = result;
                    Member.update({_id:result._id}, result/*{
                     $set: {
                     'validity': validity,
                     'cardNum':cardObject.cardNumber,
                     'smartCardId': cardObject._id,
                     'smartCardNumber': cardObject.cardRFID
                     }
                     }*/, {new: true}).lean().exec(function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        // memberObject = result;
                        return callback(null, result);
                    });

                });

            }

        ],

        function (err) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, memberObject);

        }
    );

}

exports.creditMember=addCreditToMember;/*,
 function (callback) {
 if(memberObject.cardNum!=0)
 {
 Card.findOne({cardNumber:memberObject.cardNum},function (err,result) {
 if(err)
 {
 return callback(err,null);
 }
 result.balance = memberObject.creditBalance;
 Card.findByIdAndUpdate(result._id,result,function (err,result) {
 if(err)
 {
 return callback(err,null);
 }
 return callback(null,result);
 });
 });
 }
 else
 {
 return callback(null,null);
 }

 }*/
function addCreditToMember(id,record,callback) {

    var memberObject;
    var updatedMemberObject;
    var isProcessingFeeDeducted = false;
    var payments;
    var amount = 0;
    var transObject;
    var transactionDetails;
    var validity;

    async.series([

        function (callback) {

            if(isNaN(id))
            {
                Member.findById(id, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    if (result.processingFeesDeducted) {
                        isProcessingFeeDeducted = true;
                    }

                    memberObject = result;
                    return callback(null, result);
                });
            }
            else
            {
                Member.findOne({UserID:id}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    if (result.processingFeesDeducted) {
                        isProcessingFeeDeducted = true;
                    }

                    memberObject = result;
                    return callback(null, result);
                });
            }

        },
        function (callback) {

            if(isNaN(record.createdBy))
            {

                return callback(null, null);
            }
            else
            {
                User.findOne({UserID:record.createdBy}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (result) {
                        record.createdBy = result._id;
                    }
                    return callback(null, result);
                });
            }

        },
        function (callback) {
            if(memberObject.status==Constants.MemberStatus.PROSPECTIVE)
            {
                Payments.findOne({'gatewayTransactionId':record.transactionNumber},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }

                    transactionDetails = result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            /* var orderId = 'PBS'+ new Date().getTime();*/
            if(transactionDetails)
            {
                return callback(new Error('This payment has already been completed'),null);
            }
            else {
                if (memberObject.status == Constants.MemberStatus.PROSPECTIVE) {


                    var userfeeDeposit;
                    var uf = 'PBS' + new Date().getTime();
                    userfeeDeposit = {
                        memberId: memberObject._id,
                        invoiceNo: uf,
                        paymentDescription: Constants.PayDescription.REGISTRATION,
                        paymentMode: record.creditMode,
                        paymentThrough: Constants.PayThrough.PAYMENT_GATEWAY,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        credit: record.credit,
                        balance: record.credit
                    };

                    Payments.create(userfeeDeposit, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        payments = result;
                        memberObject.creditBalance = record.credit;
                        Member.findByIdAndUpdate(memberObject._id, memberObject, {new: true}, function (err, result) {
                            if (err) {
                                return callback(err, null);
                            }
                            memberObject = result;
                        });

                        return callback(null, result);
                    });
                }
                else {
                    if (isProcessingFeeDeducted) {

                        Topup.findOne({userFees:record.credit},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            if(!result)
                            {
                                return callback(new Error("Couldn't find the top up plan for the given credit details"),null);
                            }
                            record.credit = result.topupId;
                            PaymentTransaction.topUp(memberObject, record, function (err, result) {
                                if (err) {
                                    return callback(err, null);
                                }
                                updatedMemberObject = result;
                                return callback(null, result);
                            });
                        });
                    }
                    else {
                        if(payments)
                        {
                            updatedMemberObject = memberObject;
                            return callback(null,null);
                        }
                        else
                        {
                            PaymentTransaction.newMember(memberObject, record, function (err, result) {
                                if (err) {
                                    return callback(err, null);
                                }
                                updatedMemberObject = result;
                                return callback(null, result);
                            });
                        }
                    }
                }
            }
        }/*,
         function (callback) {
         if(transactionDetails!=0)
         {
         memberObject.creditBalance=transactionDetails.balance;
         Member.findByIdAndUpdate(memberObject._id,memberObject,function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         memberObject=result;
         return callback(null,result);
         });
         }
         }*/


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(!updatedMemberObject)
        {
            return callback(new Error('Amount you entered is less than Minimum Amount'),null);
        }
        return callback(null,updatedMemberObject);
    });

}

exports.topupMember = function (id,record,callback) {
    var memberObject;
    var updatedMemberObject;
    var isProcessingFeeDeducted = false;
    var transactionDetails;
    async.series([
        function (callback) {
            if(record.credit && record.creditMode && record.transactionNumber)
            {
                return callback(null,null);
            }
            else {
                return callback(new Error("Fields missing for topup"),null);
            }
        },
        function (callback) {

            if(isNaN(id))
            {
                Member.findById(id, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    if (result.processingFeesDeducted) {
                        isProcessingFeeDeducted = true;
                    }

                    memberObject = result;
                    return callback(null, result);
                });
            }
            else
            {
                Member.findOne({UserID:id}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    if (result.processingFeesDeducted) {
                        isProcessingFeeDeducted = true;
                    }

                    memberObject = result;
                    return callback(null, result);
                });
            }

        },
        function (callback) {

            if(isNaN(record.createdBy))
            {
                return callback(null,null);
            }
            else
            {
                User.findOne({UserID:record.createdBy}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }
                    if(!result)
                    {
                        return callback(new Error('Logged in user id missing'),null);
                    }
                    record.createdBy = result._id;
                    return callback(null, result);
                });
            }

        },
        function (callback) {
            if(memberObject.status!==Constants.MemberStatus.PROSPECTIVE)
            {
                Payments.findOne({'gatewayTransactionId':record.transactionNumber},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }

                    transactionDetails = result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(transactionDetails)
            {
                return callback(new Error('This transaction number already exists, Please provide correct transaction id'),null);
            }
            else {

                if (isProcessingFeeDeducted) {
                    PaymentTransaction.topUp(memberObject, record, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        updatedMemberObject = result;
                        return callback(null, result);
                    });
                }
                else
                {
                    return callback(null,null);
                }
            }
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,updatedMemberObject);
    })
};

exports.debitMember = function (id, record, callback) {

    var memberObject;
    var location;
    async.series([

            // Step 1: Method to check and deduct processing fee
            function (callback) {
                if(isNaN(id))
                {
                    Member.findById(id, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        if (!result) {
                            return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                        }

                        if (result.creditBalance < record.debit) {
                            return callback(new Error(Messages.DEBIT_AMOUNT_CANNOT_BE_GREATER_THAN_MEMBER_CREDIT_BALANCE), null);
                        }
                        result.creditBalance=Number(result.creditBalance- record.debit);
                        result.comments = record.comments;
                        memberObject = result;
                        // Member.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                        Member.update({_id:result._id}, result, {new: true}).lean().exec(function (err, result) {
                            if (err) {
                                return callback(err, null);
                            }
                            //memberObject = result;
                            return callback(null, result);
                        })
                    });
                }
                else
                {
                    Member.findOne({UserID:id}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        if (!result) {
                            return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                        }

                        if (result.creditBalance < record.debit) {
                            return callback(new Error(Messages.DEBIT_AMOUNT_CANNOT_BE_GREATER_THAN_MEMBER_CREDIT_BALANCE), null);
                        }
                        result.creditBalance=Number(result.creditBalance- record.debit);
                        result.comments = record.comments;
                        memberObject = result;
                        // Member.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                        Member.update({_id:result._id}, result, {new: true}).lean().exec(function (err, result) {
                            if (err) {
                                return callback(err, null);
                            }
                            //memberObject = result;
                            return callback(null, result);
                        })
                    });
                }


            }/*,
             function (callback) {
             if(memberObject.cardNum!=0)
             {
             Card.findOne({cardNumber:memberObject.cardNum},function (err,result) {
             if(err)
             {
             return callback(err,null);
             }
             result.balance = memberObject.creditBalance;
             Card.findByIdAndUpdate(result._id,result,function (err,result) {
             if(err)
             {
             return callback(err,null);
             }
             return callback(null,result);
             });
             });
             }
             else
             {
             return callback(null,null);
             }

             }*/,
            function (callback) {
                if(isNaN(record.createdBy))
                {
                    User.findById(record.createdBy).lean().exec(function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            location = 'Other Location';
                            return callback(null,result);
                        }
                        if(result._type=='registration-employee')
                        {
                            RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,reg) {
                                if(err)
                                {
                                    return callback(err,null);
                                }
                                if(!result)
                                {
                                    location = 'Other Location';
                                    return callback(null,result);
                                }
                                location=reg.location;
                                return callback(null,result);
                            });
                        }
                        else {
                            location = 'Other Location';
                            return callback(null,result);
                        }

                    });
                }
                else
                {
                    User.findOne({UserID:record.createdBy}).lean().exec(function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            location = 'Other Location';
                            return callback(null,result);
                        }
                        record.createdBy = result._id;
                        if(result._type=='registration-employee')
                        {
                            RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,reg) {
                                if(err)
                                {
                                    return callback(err,null);
                                }
                                if(!result)
                                {
                                    location = 'Other Location';
                                    return callback(null,result);
                                }
                                location=reg.location;
                                return callback(null,result);
                            });
                        }
                        else {
                            location = 'Other Location';
                            return callback(null,result);
                        }

                    });
                }
            }
            ,

            // Step 3: Method to create payment transaction
            function (callback) {

                var uf = 'PBS' + new Date().getTime();
                var paymentTransaction = {
                    memberId: memberObject._id,
                    invoiceNo: uf,
                    paymentDescription: Constants.PayDescription.DEBIT_NOTE,
                    paymentMode: Constants.PayMode.OTHERS,
                    paymentThrough: Constants.PayThrough.OTHERS,
                    gatewayTransactionId: Constants.PayDescription.OTHERS,
                    comments: record.comments,
                    debit:record.debit,
                    balance:memberObject.creditBalance,
                    location:(location!=null)?location:'Other Location',
                    createdBy:record.createdBy
                };

                Payments.create(paymentTransaction, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    return callback(null, result);
                });

            }
        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(err, memberObject);

        }
    );

};

exports.cancelMembershiprequest = function (id,callback) {

    var userObject;
    var obj = {
        message:''
    };
    async.series([
        function (callback) {

            if(isNaN(id))
            {
                User.findById(id,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error('User with this id does not exist'),null);
                    }
                    userObject=result;
                    return callback(null,result);
                });
            }
            else
            {
                User.findOne({UserID:id},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error('User with this id does not exist'),null);
                    }
                    userObject=result;
                    return callback(null,result);
                });
            }

        },
        function (callback) {
            if(userObject)
            {

                if(userObject.creditBalance<0)
                {
                    var sum = userObject.creditBalance+userObject.securityDeposit;
                    obj.message="You have Negative balance of Rs."+userObject.creditBalance+", Negative balance will be recovered from your Security deposit of Rs."+userObject.securityDeposit+". Your Refund amount will be "+sum;
                }
                else if(userObject.creditBalance>0)
                {
                    obj.message="You are going to lose Rs."+userObject.creditBalance+", Your Refund amount from your Security deposit is Rs."+userObject.securityDeposit;
                }
                else
                {
                    obj.message="Your Refund amount from your Security deposit is Rs."+userObject.securityDeposit;
                }
                return callback(null,null);
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
        return callback(null,obj);
    });
};

exports.cancelMembership = function (memberId,record,callback) {

    var memberObject;
    var transactionList=[];
    var finalTransaction;
    var smartCardId;
    async.series([
        function (callback) {
            if(isNaN(memberId))
            {
                Member.findById(memberId,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(result)
                    {
                        memberObject=result;
                        smartCardId=result.smartCardId;
                        return callback(null,result);
                    }
                    else
                    {
                        return callback(new Error(Messages.USER_NOT_FOUND),null);
                    }

                });
            }
            else
            {
                Member.findOne({UserID:memberId},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(result)
                    {
                        memberId = result._id;
                        memberObject=result;
                        smartCardId=result.smartCardId;
                        return callback(null,result);
                    }
                    else
                    {
                        return callback(new Error(Messages.USER_NOT_FOUND,null));
                    }
                });
            }

        },
        function (callback) {
            var cancelmembership;
            var cancelmembership2;
            var unusedBalance;
            var poolDetails;
            if(memberObject) {
                if(memberObject.creditBalance>0)
                {
                    var ub = 'PBS' + new Date().getTime();

                    unusedBalance = {
                        memberId: memberId,
                        invoiceNo: ub,
                        paymentDescription: Constants.PayDescription.UNUSED_AMOUNT,
                        paymentMode: Constants.PayMode.OTHERS,
                        paymentThrough: Constants.PayThrough.OTHERS,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        debit: memberObject.creditBalance,
                        balance: Number(memberObject.creditBalance-memberObject.creditBalance)
                    };
                    transactionList.push(unusedBalance);
                    var cm = 'PBS' + new Date().getTime();
                    cancelmembership = {
                        memberId: memberId,
                        invoiceNo: cm,
                        paymentDescription: Constants.PayDescription.REFUND,
                        paymentMode: Constants.PayMode.OTHERS,
                        paymentThrough: Constants.PayThrough.OTHERS,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        credit: memberObject.securityDeposit,
                        balance: memberObject.securityDeposit
                    };
                    transactionList.push(cancelmembership);
                    var cm2 = 'PBS' + new Date().getTime();
                    cancelmembership2 = {
                        memberId: memberId,
                        invoiceNo: cm2,
                        paymentDescription: Constants.PayDescription.REFUND,
                        paymentMode: record.creditMode,
                        paymentThrough: (record.creditMode == 'Cash') ? record.creditMode : Constants.PayThrough.PAYMENT_GATEWAY,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        debit: memberObject.securityDeposit,
                        balance: Number(memberObject.securityDeposit-memberObject.securityDeposit)
                    };
                    transactionList.push(cancelmembership2);
                    memberObject.securityDeposit = 0;
                }
                else if(memberObject.creditBalance<0)
                {
                    memberObject.securityDeposit = memberObject.securityDeposit+memberObject.creditBalance;
                    var cm = 'PBS' + new Date().getTime();
                    cancelmembership = {
                        memberId: memberId,
                        invoiceNo: cm,
                        paymentDescription: Constants.PayDescription.REFUND,
                        paymentMode: Constants.PayMode.OTHERS,
                        paymentThrough: Constants.PayThrough.OTHERS,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        credit: memberObject.securityDeposit,
                        balance: memberObject.securityDeposit
                    };
                    transactionList.push(cancelmembership);
                    var cm2 = 'PBS' + new Date().getTime();
                    cancelmembership2 = {
                        memberId: memberId,
                        invoiceNo: cm2,
                        paymentDescription: Constants.PayDescription.REFUND,
                        paymentMode: record.creditMode,
                        paymentThrough: (record.creditMode == 'Cash') ? record.creditMode : Constants.PayThrough.PAYMENT_GATEWAY,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        debit: memberObject.securityDeposit,
                        balance: Number(memberObject.securityDeposit-memberObject.securityDeposit)
                    };
                    transactionList.push(cancelmembership2);
                }
                else
                {
                    var cm = 'PBS' + new Date().getTime();
                    cancelmembership = {
                        memberId: memberId,
                        invoiceNo: cm,
                        paymentDescription: Constants.PayDescription.REFUND,
                        paymentMode: Constants.PayMode.OTHERS,
                        paymentThrough: Constants.PayThrough.OTHERS,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        credit: memberObject.securityDeposit,
                        balance: memberObject.securityDeposit
                    };
                    transactionList.push(cancelmembership);
                    var cm2 = 'PBS' + new Date().getTime();
                    cancelmembership2 = {
                        memberId: memberId,
                        invoiceNo: cm2,
                        paymentDescription: Constants.PayDescription.REFUND,
                        paymentMode: record.creditMode,
                        paymentThrough:(record.creditMode == 'Cash') ? record.creditMode : Constants.PayThrough.PAYMENT_GATEWAY,
                        gatewayTransactionId: record.transactionNumber,
                        comments: record.comments,
                        debit: memberObject.securityDeposit,
                        balance: Number(memberObject.securityDeposit-memberObject.securityDeposit)
                    };
                    transactionList.push(cancelmembership2);
                    memberObject.securityDeposit = 0;
                }


                return callback(null,null);
                /*
                 poolDetails={
                 memberId:memberId,
                 timestamp:new Date().getTime(),
                 amount:memberObject.creditBalance
                 };

                 PoolAccount.create(poolDetails,function (err,result) {
                 if (err) {
                 return callback(err, null);
                 }
                 });
                 return callback(null,null);*/
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(transactionList.length>0)
            {
                /* var i;
                 for(i=0;i<transactionList.length;i++)
                 {*/
                Payments.create(transactionList,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(result.length>0)
                    {
                        finalTransaction=result;
                        /*console.log(i);
                         if(i==transactionList.length-1)
                         {*/
                        return callback(null,result);
                        //}
                    }
                    else
                    {
                        return callback(new Error("Coundn't to complete cancel process"),null);
                    }

                });
                // }

            }
            else
            {
                return callback(null,memberObject);
            }

        }
        ,
        function (callback) {
            if(finalTransaction.length>0)
            {
                Member.findByIdAndUpdate(memberId, {
                    $unset: {
                        membershipId:'',
                        validity:''
                    }
                },{new:true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    var len = finalTransaction.length-1;
                    // Member.findByIdAndUpdate(memberId,{$set:{'status':Constants.MemberStatus.CANCELLED,'creditBalance':finalTransaction[len].balance,'securityDeposit':memberObject.securityDeposit,'processingFeesDeducted':false}},{new:true},function (err,result) {
                    result.status=Constants.MemberStatus.CANCELLED;
                    result.creditBalance = finalTransaction[len].balance;
                    result.securityDeposit = memberObject.securityDeposit;
                    result.processingFeesDeducted=false;
                    memberObject = result;
                    Member.update({_id:result._id}, result).exec(function (err) {
                        if(err)
                        {
                            return callback(err, null);
                        }
                        // memberObject = result;
                        return callback();
                    });
                });
            }
            else
            {
                return callback(null,null);
            }


        },
        function (callback) {
            if(memberObject.cardNum)
            {
                if(Number(memberObject.cardNum)!=0) {
                    CardService.deactivateCard(memberObject.cardNum, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        return callback(null, result);
                    });
                }
                else
                {
                    return callback(null,null);
                }
            }
            else
            {
                return callback(null,null);
            }
        }
        /*,
         function (callback) {
         if(smartCardId)
         {
         Card.findOne({'_id':smartCardId},{$unset:{'status':Constants.CardStatus.INACTIVE,'assignedTo':'','membershipId':''}},function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         /!*result.status=Constants.CardStatus.INACTIVE;
         result.assignedTo='';
         result.membershipId='';
         Card.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
         if(err)
         {
         return callback(err,null);
         }*!/
         return callback(null,result);
         // });
         });

         }
         else
         {
         return callback(null,null);
         }

         }*/

    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,memberObject);
    })

};

exports.suspendMembership = function (memberId,record,callback) {

    if(isNaN(memberId))
    {
        Member.findById(memberId,function (err,memObj) {
            if(err)
            {
                return callback(err,null);
            }
            if(!memObj)
            {
                return callback(new Error(Messages.USER_NOT_FOUND),null);
            }
            memObj.comments = record.comments;
            memObj.status = Constants.MemberStatus.SUSPENDED;

            /*        Member.findByIdAndUpdate(memberId, {
             $set: {
             //'validity': validity,
             'comments': record.comments,
             'status':Constants.MemberStatus.SUSPENDED
             }
             },{new:true}, function (err, result) {*/
            Member.update({_id:memObj._id}, memObj, {new: true}).lean().exec(function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, memObj);

            });
        });

    }
    else {
        Member.findOne({UserID: memberId}, function (err, memObj) {
            if (err) {
                return callback(err, null);
            }
            if(!memObj)
            {
                return callback(new Error(Messages.USER_NOT_FOUND),null);
            }
            memObj.comments = record.comments;
            memObj.status = Constants.MemberStatus.SUSPENDED;

            /*        Member.findByIdAndUpdate(memberId, {
             $set: {
             //'validity': validity,
             'comments': record.comments,
             'status':Constants.MemberStatus.SUSPENDED
             }
             },{new:true}, function (err, result) {*/
            Member.update({_id: memObj._id}, memObj, {new: true}).lean().exec(function (err, result) {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, memObj);

            });
        });
    }
};

exports.searchMember = function (record,callback) {
    var findMem = record.name;
    if(findMem)
    {
        if(findMem!='')
        {
            if(isNaN(findMem))
            {
                Member.find({$or: [{Name: new RegExp(findMem, 'i')}, {email: new RegExp(findMem, 'i')},{lastName:new RegExp(findMem, 'i')},{phoneNumber:new RegExp(findMem, 'i')},{smartCardNumber: new RegExp(findMem, 'i')}],_type:'member'},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    return callback(null,result);
                });
            }
            else
            {
                Member.find({cardNum:findMem,_type:'member'},function (err,result) {
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

exports.addMember=function (record,callback) {

    /*   var memberData={
     name:record.Name,
     phoneNumber
     address
     city
     country
     };
     */
    var documents = [];
    var profilePic = {};
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
    var password;
    var ResetKey;
    var passwordFlag = 0;
    var location;
    var valid = false;
    var otprequired = true;
    var countrycode;

    async.series([
        /*     function (callback) {

         if (record.password) {
         password = record.password;
         return callback(null, null);
         } else {
         random.strings({"length": 6, "number": 1, "upper": true, "digits": true}, function (err, data) {

         if (err) {
         return callback(err, null);
         }

         password = data;
         return callback(null, data);
         });
         }

         }*/

        function (callback) {

            if (record.password) {
                password = record.password;
                record.emailVerified=true;
                if (password.length >= 6)
                {
                    //if password contains both lower and uppercase characters, increase strength value
                    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
                    {
                        //if it has numbers and characters, increase strength value
                        if (password.match(/([0-9])/))
                        {
                            //if it has one special character, increase strength value
                            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
                            {
                                if(record.cpassword==password)
                                {
                                    return callback(null,true);
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
                passwordFlag = 1;
                return callback(null, null);
            } else {
                random.strings({"length": 12, "number": 1, "upper": true, "digits": true}, function (err, data) {

                    if (err) {
                        return callback(err, null);
                    }
                    if(!data)
                    {
                        return callback(new Error("Couldn't able to generate random key, Please try again"),null);
                    }
                    //password=data.split('').reverse().join('');
                    ResetKey = data;
                    return callback(null, data);
                });
            }

        },
        function (callback) {

            if(isNaN(record.createdBy))
            {
                User.findById(record.createdBy,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        location = 'Other Location';
                        return callback(null,result);
                    }
                    record.createdBy = result._id;
                    if(result._type=='registration-employee')
                    {
                        RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,reg) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            if(!result)
                            {
                                location = 'Other Location';
                                return callback(null,result);
                            }
                            location=reg.location;
                            return callback(null,result);
                        });
                    }
                    else {
                        location = 'Other Location';
                        return callback(null,result);
                    }

                });
            }
            else
            {
                User.findOne({UserID:record.createdBy},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        location = 'Other Location';
                        return callback(null,result);
                    }
                    record.createdBy = result._id;
                    if(result._type=='registration-employee')
                    {
                        RegCenter.findOne({'stationType':'registration-center','assignedTo':record.createdBy}).lean().exec(function (err,reg) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            if(!reg)
                            {
                                location = 'Other Location';
                                return callback(null,null);
                            }
                            location=reg.location;
                            return callback(null,result);
                        });
                    }
                    else {
                        location = 'Other Location';
                        return callback(null,result);
                    }

                });
            }

        }
        ,
        function (callback) {

            documents = record.documents;
            profilePic = record.profilePic;
            record.documents = [];
            record.profilePic = '';
            record.password=password;

            if(record.UserID==0)
            {
                var memData = {
                    Name:record.Name,
                    lastName:record.lastName,
                    //email:record.email,
                    password: record.password,
                    //phoneNumber:record.phoneNumber,
                    sex:record.sex,
                    address:record.address,
                    city:record.city,
                    state:record.state,
                    country:record.country,
                    createdBy:record.createdBy,
                    registeredLocation:location,
                    resetPasswordKey:ResetKey,
                    resetPasswordKeyValidity:moment().add(2,'hours')
                };
                if(record.phoneNumber)
                {
                    if(record.phoneNumber.length>8)
                    {
                        memData.phoneNumber = record.phoneNumber;
                    }
                }
                if(record.email)
                {
                    memData.email = record.email;
                }
                Member.create(memData,function (err,result) {
                    if(err)
                    {
                        valid = false;
                        return callback(err,null);
                    }
                    memberDetails=result;
                    return callback(null,result);
                });
            }else
            {
                var memData = {
                    Name:record.Name,
                    lastName:record.lastName,
                    //email:record.email,
                    //phoneNumber:record.phoneNumber,
                    sex:record.sex,
                    address:record.address,
                    city:record.city,
                    state:record.state,
                    country:record.country,
                    createdBy:record.createdBy,
                    registeredLocation:location

                };
                if(record.phoneNumber)
                {
                    if(record.phoneNumber.length>8)
                    {
                        memData.phoneNumber = record.phoneNumber;
                    }
                }
                if(record.email)
                {
                    memData.email = record.email;
                }
                if(record.UserID)
                {
                    Member.findOneAndUpdate({UserID:record.UserID},memData,{new:true},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        memberDetails = result;
                        return callback(null,result);
                    });
                }
                else
                {
                    return callback(null,null);
                }

            }

        },
        function (callback) {

            if (profilePic) {

                var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails.UserID+"/";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                var docNumber =memberDetails.UserID+ uuid.v4();
                var docFilePath = dir+ docNumber+".png";
                if(profilePic.result)
                {
                    var decodedDoc = new Buffer(profilePic.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                    var fileDetails = {
                        key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails.UserID + '/ ' + docNumber + '.png',
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
                    memberDetails.profilePic = docNumber;
                }

                return callback(null, null);

            } else {
                return callback(null, null);
            }

        },
        function (callback) {
            if (record.memberprofilePic) {

                var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails.UserID+"/";

                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                var docNumber =memberDetails.UserID+ uuid.v4();
                var docFilePath = dir+ docNumber+".png";

                if(record.memberprofilePic.result)
                {
                    var decodedDoc = new Buffer(record.memberprofilePic.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                    var fileDetails = {
                        key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails.UserID + '/ ' + docNumber + '.png',
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
                    memberDetails.memberprofilePic = docNumber;
                }

                return callback(null, null);

            } else {
                return callback(null, null);
            }

        }
        ,
        function (callback) {
            if (documents) {

                for (var i = 0; i < documents.length; i++) {

                    var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails.UserID+"/";

                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    //var docFilePath = "./temp/doc" + i + Date.now() + ".png";
                    var docNumber = i + uuid.v4();
                    var docFilePath = dir+ docNumber+".png";

                    // Check if there is a new document available
                    if (documents[i].documentCopy.result) {

                        var decodedDoc = new Buffer(documents[i].documentCopy.result.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');

                        /*var fileDetails = {
                         key: config.get('aws.bucket') + config.get('awsFolders.member') + memberObject.memberId + '/' + docNumber + '.png',
                         filePath: docFilePath
                         };*/
                        var fileDetails = {
                            key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails.UserID + '/ ' + docNumber + '.png',
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

                        documents[i].documentCopy = docNumber;

                    }

                    // removing document name if type not Other
                    if (documents[i].documentType != "Other") {
                        documents[i].documentName = "";
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

            if (documents) {

                for (var i = 0; i < documents.length; i++) {

                    if(documents[i].documentType=='Aadhar')
                    {
                        otprequired = false;
                    }
                    var docDetails = {
                        documentType: documents[i].documentType,
                        documentNumber: documents[i].documentNumber,
                        documentCopy: documents[i].documentCopy,
                        documentName: documents[i].documentName,
                        description: documents[i].description
                    };

                    docArray.push(docDetails);
                }
                memberDetails.documents = docArray;
                /*memberDetails.resetPasswordKey = ResetKey;
                 memberDetails.resetPasswordKeyValidity = moment().add(2,'hours');*/
                memberDetails.profilePic = record.profilePic;

                Member.findByIdAndUpdate(memberDetails._id,memberDetails,{new:true},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    memberDetails = result;
                    return callback(null,result);
                });

                //return callback(null, null);
            }
            else
            {
                return callback(null, null);
            }

        },
        function (callback) {
            if(otprequired)
            {
                if(!memberDetails.otpVerified)
                {
                    if(memberDetails.phoneNumber)
                    {
                        if(memberDetails.phoneNumber.length==10)
                        {
                            var data = {
                                phoneNumber: memberDetails.phoneNumber,
                                UserID : memberDetails.UserID
                            };
                            otprequest(data,function (err,result) {
                                if(err)
                                {
                                    return callback(err,null);
                                }
                                memberDetails.otpstatus = result.otpstatus;
                                return callback(null,result);
                            });
                        }
                        else if(memberDetails.phoneNumber.length>10)
                        {
                            var temp = record.phoneNumber.split('-');
                            if(temp[0].length<=5)
                            {
                                countrycode = temp[0];
                            }
                            else
                            {
                                countrycode = temp[1];
                            }
                            if(Number(countrycode)==91)
                            {
                                var data = {
                                    phoneNumber: memberDetails.phoneNumber,
                                    UserID : memberDetails.UserID
                                };
                                otprequest(data,function (err,result) {
                                    if(err)
                                    {
                                        return callback(err,null);
                                    }
                                    memberDetails.otpstatus = result.otpstatus;
                                    return callback(null,result);
                                });
                            }
                            else
                            {
                                return callback(null,null);
                            }
                        }
                        else
                        {
                            return callback(new Error('Invalid number to send OTP'),null);
                        }

                    }
                    else
                    {
                        return callback(new Error('No phone number exist to send OTP'),null);
                    }
                }
                else
                {
                    valid = true;
                    return callback(null,null);
                }

            }
            else
            {
                valid = true;
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            if(valid)
            {
                valid = false;
                CardService.cardAvailableForMember(record.cardNumber,function (err,result) {
                    if(err)
                    {
                        if(err.message=="This card has already been assigned to a user")
                        {
                            err.name = "CardError";
                            err.message=memberDetails.UserID;
                            return callback(err,null);
                        }
                        else
                        {
                            return callback(err,null);
                        }
                    }
                    valid = true;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }

        },
        function (callback) {
            if(valid)
            {
                if(record.membershipId)
                {
                    Membership.findOne({membershipId:record.membershipId},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error(Messages.NO_MEMBERSHIP_FOUND),null);
                        }
                        memberDetails.membershipId = result._id;
                        record.creditBalance = Number(result.userFees+result.securityDeposit+result.smartCardFees+result.processingFees);
                        assignMemberShip(memberDetails._id,memberDetails.membershipId,function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            return callback(null,result);
                        });
                    });
                }
                else
                {
                    return callback(null,null);
                }
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(valid)
            {

                if(memberDetails.creditBalance>0)
                {
                    return callback(null,null);
                }
                else
                {
                    var creditData = {
                        transactionNumber: record.transactionNumber,
                        credit:record.creditBalance,
                        comments:record.comments,
                        creditMode:record.creditMode
                    };
                    if(memberDetails.createdBy)
                    {
                        creditData.createdBy=memberDetails.createdBy;
                    }
                    addCreditToMember(memberDetails._id,creditData,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        memberDetails = result;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            if(valid)
            {
                if(memberDetails.smartCardNumber)
                {
                    return callback(null,null);
                }
                else
                {
                    assignCard(memberDetails._id,record.cardNumber,memberDetails.membershipId,memberDetails.createdBy,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        memberDetails=result;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        }
        ,
        function (callback) {
            if(valid)
            {
                if(memberDetails.email!=null && memberDetails.email!='' && memberDetails.email!='undefined')
                {
                    if(passwordFlag==1)
                    {
                        var data = {
                            profileName: memberDetails.Name,
                            //password: password,
                            link: config.get('pbsMemberPortal.url')
                        };

                        var htmlString = swig.renderFile('./templates/member-registered-with-password.html', data);

                        var emailMessage = {
                            "subject": Messages.SIGN_UP_SUCCESSFUL,
                            "text": EmailNotificationHandler.renderSignUpTemplate(TemplatesMessage.signUp, data),
                            "html": htmlString,
                            "to": [memberDetails.email]
                        };

                        EmailNotificationHandler.sendMail(emailMessage);
                    }
                    else
                    {
                        var data = {
                            profileName: memberDetails.Name,
                            //password: password,
                            link: config.get('pbsMemberPortal.resetUrl')+ResetKey
                        };

                        var htmlString = swig.renderFile('./templates/member-registered.html', data);

                        var emailMessage = {
                            "subject": Messages.SIGN_UP_SUCCESSFUL,
                            "text": EmailNotificationHandler.renderSignUpTemplate(TemplatesMessage.signUp, data),
                            "html": htmlString,
                            "to": [memberDetails.email]
                        };

                        EmailNotificationHandler.sendMail(emailMessage);
                    }

                    return callback(null, null);
                }
                else
                {
                    return callback(null,null);
                }
            }
            else
            {
                return callback(null,null);
            }
        }/*,
         function (callback) {
         Station.find({stationType:'dock-station'},function (err,result) {
         if(err)
         {
         console.log('Error fetching station');
         }
         if(result.length>0)
         {
         for(var i=0;i<result.length;i++)
         {
         memberDetails.unsuccessIp.push(result[i].ipAddress);
         }
         Member.findByIdAndUpdate(memberDetails._id, memberDetails, {new: true}, function (err, result) {
         //Member.update({_id:memberDetails._id}, memberDetails, {new: true}).lean().exec(function (err, result) {
         if (err) {
         return callback(err, null);
         }

         memberDetails = result;
         return callback(null, result);
         });
         }
         });

         }*/


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,memberDetails);
    });

};

exports.requestOTP = otprequest;
function otprequest(record,callback) {

    var resData={};
    var otp;
    var msg = " is your OTP for registering at Trin Trin. OTP is valid for 30 mins. If this is not done by you contact 0821-2333000";
    async.waterfall([
        function (callback) {
            random.numbers({"number": 1,"minimum": 100000, "maximum": 1000000}, function (err, data) {

                if (err) {
                    return callback(err, null);
                }
                if(!data)
                {
                    return callback(new Error("Couldn't able to generate random key, Please try again"),null);
                }
                otp=data;
                if(record.phoneNumber.length>10)
                {
                    var temp = record.phoneNumber.split('-');
                    if(temp[0].length==10)
                    {
                        record.phoneNumber = temp[0];
                    }
                    else
                    {
                        record.phoneNumber = temp[1];
                    }
                }
                return callback(null, data);
            });
        },
        function (data,callback) {
            User.findOne({UserID:record.UserID},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    result.otp = data;
                    result.otpValidity = moment().add(30,'minutes');
                    User.findByIdAndUpdate(result._id,result,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });
                }
                else
                {
                    return callback(new Error(Messages.USER_NOT_FOUND),null);
                }
            });
        }
        ,
        function (result,callback) {

            if(record.phoneNumber)
            {
                if(record.phoneNumber.length==10 && !isNaN(record.phoneNumber))
                {
                    var m = otp+msg;
                    var tel = "tel:"+record.phoneNumber;
                    var requestBody ={"outboundSMSMessageRequest":{
                        "address":["tel:"+record.phoneNumber],
                        "senderAddress":"tel:MOBKAR",
                        "outboundSMSTextMessage":{"message":m},
                        "clientCorrelator":"",
                        "messageType":"0",
                        "category":"SHIVU-Testing",
                        "receiptRequest": {"notifyURL":"",
                            "callbackData":"$(callbackData)"},
                        "senderName":"MOBKAR"}
                    };
                    //requestBody.address.push(tel);
                    OtpHandler.requestHandler(requestBody,function (err,otpdata) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,otpdata);
                    });
                }
                else
                {
                    return callback(new Error('Invalid Phone Number'),null);
                }
            }
            else
            {
                return callback(null,null);
            }

        },
        function (otpdata,callback) {
            if(otpdata)
            {
                if(otpdata.outboundSMSMessageRequest.deliveryInfoList.deliveryInfo.deliveryStatus)
                {
                    if(otpdata.outboundSMSMessageRequest.deliveryInfoList.deliveryInfo.deliveryStatus=='Submitted')
                    {

                        resData.otpstatus='success';

                        return callback(null,resData);
                    }
                    else
                    {

                        resData.otpstatus=otpdata.outboundSMSMessageRequest.deliveryInfoList.deliveryInfo.deliveryStatus;

                        return callback(null,resData);
                    }
                }
                else
                {
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
        return callback(null,resData);
    });
}

exports.verifyOTP = function (record,callback) {

    var userDetails;
    async.waterfall([
        function (callback) {
            User.findOne({UserID:record.UserID},function (err,userData) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!userData)
                {
                    return callback(new Error('No User found for this ID'),null);
                }
                return callback(null,userData);
            });
        },
        function (userData,callback) {
            if(userData.otp==record.otp)
            {
                var durationMin = moment.duration(moment(userData.otpValidity).diff(moment()));
                var duration = durationMin.asMinutes();
                if(duration<0)
                {
                    return callback(new Error('Your OTP validity expired'),null);
                }
                else
                {
                    userData.otpVerified = true;
                    User.findByIdAndUpdate(userData._id,userData,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        User.findByIdAndUpdate(result._id, {$unset: {otpValidity: "", otp:""}}, {new: true}, function (err, result) {

                            if (err) {
                                return callback(err, null);
                            }
                            userDetails=result;
                            return callback(null,result);
                        });

                    });
                }
            }
            else
            {
                return callback(new Error("OTP doesn't match or it might expired"),null);
            }
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,userDetails);
    })
};