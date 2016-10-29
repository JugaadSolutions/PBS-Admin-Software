/**
 * Created by root on 29/10/16.
 */
var Features = require('../models/features-list');


exports.createFeature=function (record,callback) {
    Features.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

};