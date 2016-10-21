var Member = require('../models/member'),
    fs = require('fs'),
    UploadHandler = require('../handlers/upload-handler'),
    uuid = require('node-uuid'),
    async=require('async'),
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
    var memberDetails;
    var filesArray = [];
    var filesArrayToWrite = [];
 async.series([
     function (callback) {
         documents = record.documents;
         record.documents = [];
         Member.create(record,function (err,result) {
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

                 var dir = '/usr/share/nginx/html/mytrintrin/Member/'+memberDetails._id+"/";

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
                         key: '/usr/share/nginx/html/mytrintrin/Member/' + memberDetails._id + '/ ' + docNumber + '.png',
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

         Member.findById(memberDetails._id, function (err, result) {

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

             Member.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {

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
