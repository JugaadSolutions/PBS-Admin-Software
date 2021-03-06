/**
 * Created by root on 17/1/17.
 */
var async = require('async'),
    moment = require('moment'),
    User = require('../models/user'),
    kiosk = require('../models/kiosk');

exports.createKiosktransaction = function (record,callback) {

    User.findOne({smartCardNumber:record.cardRFID},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(!result)
        {
            return callback(new Error("No user found for this RFID"),null);
        }
        record.user = result._id;
        kiosk.create(record,function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
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
    var data={};
    async.series([
        function (callback) {
        if(record.fromdate && record.todate)
        {
            var fdate = moment(record.fromdate);
            fdate=fdate.format('YYYY-MM-DD');
            var ldate = moment(record.todate).add(1, 'days');
            ldate=ldate.format('YYYY-MM-DD');
            kiosk.find({dateTime:{$gte:moment(fdate),$lte:moment(ldate)},duration:{$lte:Number(record.duration)}}).deepPopulate('user').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                notrans=result.length;
                if(result.length>0)
                {
                    data.kiosks = result;
                }
                return callback(null,result);
            });
        }
        else
        {
            return callback(new Error('Please provide from date and to date both'),null);
        }

        },
        function (callback) {
            if(record.fromdate && record.todate)
            {
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
            else
            {
                return callback(new Error('Please provide from date and to date both'),null);
            }
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        if(result)
        {
            //res=(notrans/totalTrans)*100;
            data.total=(notrans/totalTrans)*100;
            return callback(null,data);
        }
        else
        {
            return callback(null,null);
        }
    });
};

