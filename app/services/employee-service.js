/**
 * Created by root on 29/10/16.
 */
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    random = require("node-random"),
    Messages = require('../core/messages'),
    EmailNotificationHandler = require('../handlers/email-notification-handler'),
    TemplatesMessage = require('../../templates/text-messages'),
    swig = require('swig'),
    User = require('../models/user'),
    Card = require('../models/card'),
    CardService = require('../services/card-service'),
    Constants = require('../core/constants'),
    UploadHandler = require('../handlers/upload-handler'),
    RegEmployee = require('../models/registration-staff'),
    RedistributionEmployee =require('../models/redistribution-staff'),
    MaintenanceEmployee = require('../models/maintanancecentre-staff');


exports.createEmployee=function (record,id,callback) {

    /*   var memberData={
     name:record.Name,
     phoneNumber
     address
     city
     country
     };
     */
    var documents = [];
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
    var password;
    async.series([
        function (callback) {

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

        },
        function (callback) {
            documents = record.documents;
            record.documents = [];
            record.password=password;
            if(id==1)
            {
                RegEmployee.create(record,function (err,result) {
                    if(err)
                    {
                     return callback(err,null);
                    }
                    memberDetails=result;
                    return callback(null,result);
                });
            }
            if(id==2)
            {
                MaintenanceEmployee.create(record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    memberDetails=result;
                    return callback(null,result);
                });
            }
            if(id==3)
            {
                RedistributionEmployee.create(record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    memberDetails=result;
                    return callback(null,result);
                });
            }
        },
        function (callback) {
            if (documents) {

                for (var i = 0; i < documents.length; i++) {

                    var dir = '/usr/share/nginx/html/mytrintrin/Employee/'+memberDetails._id+"/";

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
                            key: '/usr/share/nginx/html/mytrintrin/Employee/' + memberDetails._id + '/ ' + docNumber + '.png',
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

            User.findById(memberDetails._id, function (err, result) {

                if (err) {
                    return callback(err, null);
                }

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

                if (record.profilePic) {
                    result.picture = record.profilePic;
                }
                result.documents = docArray;

                User.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });

            });
        },
        function (callback) {

            var data = {
                profileName: memberDetails.Name,
                password: password
            };

            var htmlString = swig.renderFile('./templates/member-registered.html', data);

            var emailMessage = {
                "subject": Messages.SIGN_UP_SUCCESSFUL,
                "text": EmailNotificationHandler.renderSignUpTemplate(TemplatesMessage.signUp, data),
                "html": htmlString,
                "to": [memberDetails.email]
            };

            EmailNotificationHandler.sendMail(emailMessage);

            return callback(null, null);
        }


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,memberDetails);
    });

};

exports.updateEmployee = function (record,callback) {

    //var documents = [];
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
    async.series([
        function (callback) {
            if (record.documents) {

                for (var i = 0; i < record.documents.length; i++) {

                    var dir = '/usr/share/nginx/html/mytrintrin/Employee/'+record._id+"/";

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
                            key: '/usr/share/nginx/html/mytrintrin/Employee/' + record._id + '/ ' + docNumber + '.png',
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

            if (record.profilePic) {
                record.picture = record.profilePic;
            }
            //result.documents = docArray;

            if(record._type=='maintenancecentre-employee')
            {
                MaintenanceEmployee.findByIdAndUpdate(record._id, record, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }
            if(record._type=='registration-employee') {
                RegEmployee.findByIdAndUpdate(record._id, record, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }

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

exports.addCard = function (memberId, cardNumber, callback) {

    var cardObject;
    var memberObject;
    var memberName;
    var validity;

    async.series([
            /*function (callback) {

             },*/

            // Step 1: Method to check for any assigned cards
            function (callback) {

                User.findById(memberId, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    if (!result) {
                        return callback(new Error(Messages.NO_MEMBER_FOUND), null);
                    }

                    memberName = result.Name;
                    if (result.cardNum) {

                        CardService.deactivateCard(result.cardNum, function (err, result) {

                            if (err) {
                                return callback(null, null);
                            }

                            return callback(null, result);
                        });

                    } else {
                        return callback(null, null);
                    }
                });

            },

            // Step 2: Method to verify and update card
            function (callback) {

                CardService.cardAvailableForMember(cardNumber, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    result.status = Constants.CardStatus.ACTIVE;
                    result.assignedTo = memberId;
                    result.assignedToName = memberName;

                    Card.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {

                        if (err) {
                            return callback(err, null);
                        }

                        cardObject = result;
                        return callback(null, result);
                    });

                });
            }
            ,
            // Step 3: Method to update member card details
            function (callback) {

                User.findByIdAndUpdate(memberId, {
                    $set: {
                        'cardNum':cardObject.cardNumber,
                        'smartCardId': cardObject._id,
                        'smartCardNumber': cardObject.cardRFID
                    }
                }, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberObject = result;
                    return callback(null, result);
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

};