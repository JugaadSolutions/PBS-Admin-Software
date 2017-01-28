/**
 * Created by root on 17/1/17.
 */
var async = require('async'),
    moment = require('moment'),
    kiosk = require('../models/kiosk');

exports.createKiosktransaction = function (record,callback) {
    kiosk.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getkioskReport= function (record,callback) {
    if(record.duration==0)
    {
        record.duration=4;
    }
    var notrans;
    var totalTrans;
    var res;
    async.series([
        function (callback) {
            var fdate = moment(record.fromdate);
            fdate=fdate.format('YYYY-MM-DD');
            var ldate = moment(record.todate).add(1, 'days');
            ldate=ldate.format('YYYY-MM-DD');
            kiosk.count({dateTime:{$gte:moment(fdate),$lte:moment(ldate)},duration:{$lte:Number(record.duration)}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                notrans=result;
                return callback(null,result);
            });
        },
        function (callback) {
            var fdate = moment(record.fromdate);
            fdate=fdate.format('YYYY-MM-DD');
            var ldate = moment(record.todate).add(1, 'days');
            ldate=ldate.format('YYYY-MM-DD');
            kiosk.count({dateTime:{$gte:moment(fdate),$lte:moment(ldate)}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                totalTrans=result;
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(result)
        {
            res=(notrans/totalTrans)*100;
            return callback(null,res);
        }
    });
};

