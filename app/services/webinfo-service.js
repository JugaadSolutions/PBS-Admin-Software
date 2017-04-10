/**
 * Created by root on 1/4/17.
 */
var User = require('../models/user'),
    moment = require('moment'),
    Webinfo = require('../models/websiteInfo');

exports.createWebinfo = function (record,callback) {
        if(isNaN(record.createdBy))
        {
            Webinfo.create(record,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
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
                    Webinfo.create(record,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });
                }
                else
                {
                    return callback(new Error('No User found'),null);
                }
            });
        }

};

exports.getWebinfo = function (record,callback) {

    if(record.fromdate && record.todate)
    {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        Webinfo.find({dateTime:{$gte:moment(fdate),$lt:moment(ldate)}},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        return callback(new Error("Please provide from date and to date both"),null);
    }
};