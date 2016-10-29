/**
 * Created by root on 29/10/16.
 */
var async = require('async'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    UploadHandler = require('../handlers/upload-handler'),
    RegEmployee = require('../models/registration-staff');


exports.createEmployee=function (record,callback) {

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
    async.series([
        function (callback) {
            documents = record.documents;
            record.documents = [];
            RegEmployee.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                memberDetails=result;
                return callback(null,result);
            });
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

            RegEmployee.findById(memberDetails._id, function (err, result) {

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

                RegEmployee.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    memberDetails = result;
                    return callback(null, result);
                });

            });
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

            RegEmployee.findByIdAndUpdate(record._id, record, {new: true}, function (err, result) {

                if (err) {
                    return callback(err, null);
                }

                memberDetails = result;
                return callback(null, result);
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