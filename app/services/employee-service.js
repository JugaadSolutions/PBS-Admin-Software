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
    config = require('config'),
    moment = require('moment'),

    Station = require('../models/station'),
    LeaveTrack = require('../models/leave-tracker'),
    User = require('../models/user'),
    Card = require('../models/card'),
    CardService = require('../services/card-service'),
    Constants = require('../core/constants'),
    UploadHandler = require('../handlers/upload-handler'),
    RegEmployee = require('../models/registration-staff'),
    Operator = require('../models/operator'),
    AccountStaff = require('../models/accounts-admin'),
    DockingStation = require('../models/dock-station'),
    Monitorgrp = require('../models/monitor-group'),
    HoldingareaStaff = require('../models/holdingarea-staff'),
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
    var ResetKey;
    var IPs = [];
    async.series([
        function (callback) {

            if (record.password) {
                password = record.password;
                return callback(null, null);
            } else {
                random.strings({"length": 12, "number": 1, "upper": true, "digits": true}, function (err, data) {

                    if (err) {
                        return callback(err, null);
                    }
                    password=data;
                    ResetKey = data;
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
            if(id==4)
            {
                Operator.create(record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    memberDetails=result;
                    return callback(null,result);
                });
            }
            if(id==5)
            {
                AccountStaff.create(record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    memberDetails=result;
                    return callback(null,result);
                });
            }
            if(id==6)
            {
                Monitorgrp.create(record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    memberDetails=result;
                    return callback(null,result);
                });
            }
            if(id==7)
            {
                HoldingareaStaff.create(record,function (err,result) {
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
            Station.find({stationType:'dock-station'},function (err,result) {
                if(err)
                {
                    console.log('Error fetching station');
                }
                if(result.length>0)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        IPs.push(result[i].StationID);
                        if(i==result.length-1)
                        {
                            return callback(null,result);
                        }
                    }
                }
                else
                {
                    return callback(null,null);
                }
            });

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
                result.unsuccessIp=IPs;
                result.resetPasswordKey = ResetKey;
                result.resetPasswordKeyValidity = moment().add(2,'hours');
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
                //password: password
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
                MaintenanceEmployee.update({_id:record._id}, record, {new: true}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }
            if(record._type=='registration-employee') {
                RegEmployee.update({_id:record._id}, record, {new: true}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }
            if(record._type=='redistribution-employee') {
                RedistributionEmployee.update({_id:record._id}, record, {new: true}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }
            if(record._type=='Operator') {
                Operator.update({_id:record._id}, record, {new: true}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }
            if(record._type=='Monitor-group') {
                Monitorgrp.update({_id:record._id}, record, {new: true}).lean().exec( function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }
            if(record._type=='Accounts-admin') {
                AccountStaff.update({_id:record._id}, record, {new: true}).lean().exec(function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });
            }
            if(record._type=='Holdingarea-employee') {
                HoldingareaStaff.update({_id:record._id}, record, {new: true}).lean().exec(function (err, result) {

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

                User.findOne({'_id':memberId},function (err,result) {
                    if(err)
                    {
                        return console.error('Error : '+err);
                    }


                DockingStation.find({'stationType':'dock-station'},'StationID',function (err,ds) {
                    if(err)
                    {
                        return console.error('Error : '+err);
                    }
                    result.unsuccessIp=[];
                    for(var i=0;i<ds.length;i++)
                    {
                        result.unsuccessIp.push(ds[i].StationID);
                    }
                    //result.unsuccessIp = ds;
                    result.successIp=[];
                    result.updateCount=0;
                    result.cardNum=cardObject.cardNumber;
                    result.smartCardId = cardObject._id;
                    result.smartCardNumber = cardObject.cardRFID;
                    User.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                        if (err)
                        {
                            return console.error('Error : '+err);
                        }
                        memberObject = result;
                        return callback(null, result);
                    });
                });

/*                User.findByIdAndUpdate(memberId, {
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
                });*/
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

exports.addLeaveDetails = function (record,callback) {

    var leave;
    async.series([
        function (callback) {
            LeaveTrack.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                leave=result;
                    return callback(null,result);
            });
        },
        function (callback) {
            User.findOne({'_id':record.empid},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                var l = {
                    leavetrackId:leave._id
                };
                result.leavetrackIds.push(l);
                    User.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });

            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,leave);
    })
};

exports.getOneEmployeeLeaveInfo = function (id,callback) {

    var leave;
    var allleaves;
    async.series([
        function (callback) {
            LeaveTrack.findOne({'_id':id},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                leave = result;
                return callback(null,result);
            });
        },
        function (callback) {
            LeaveTrack.find({'empid':leave.empid}).deepPopulate('empid createdBy').sort('-createdDate').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                allleaves = result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,allleaves);
    });


};