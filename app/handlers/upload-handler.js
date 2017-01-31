
var
    fs = require('fs'),

    async = require('async');


// Method to write multiple files
exports.writeFile = function (filesArray, callback) {

    async.each(filesArray, function (file, callback) {

        fs.writeFile(file.filePath, file.file, function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, result);

        });

    }, function (err, result) {

        if (err) {
            return callback(err, null);
        }
        else {
            return callback(err, result);
        }
    });

};

