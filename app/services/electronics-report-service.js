/**
 * Created by root on 3/4/17.
 */
var User = require('../models/user'),
    async = require('async'),
    moment = require('moment'),
    Station = require('../models/station'),
    Messages = require('../core/messages'),
    Ereports = require('../models/electronics-reports');

exports.createElectronicsReport = function (record,callback) {

    var stationDetails;
    var eReports;
    async.series([
        function (callback) {
            if(record.createdBy)
            {
                User.findOne({UserID:record.createdBy},function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        return callback(new Error('Logged in user Id not found'));
                    }
                    record.createdBy = result._id;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(record.stationId)
            {
                if(isNaN(record.stationId))
                {
                    return callback(new Error('Error in Station Id'),null);
                }
                else
                {
                    Station.findOne({StationID:record.stationId},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error('Station not found for the given id'),null);
                        }
                        stationDetails = result;
                        record.stationId = result._id;
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(new Error("Couldn't find station id from the view"),null);
            }

        },
        function (callback) {
            if(stationDetails)
            {
                Ereports.create(record,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    eReports = result;
                    return callback(null,result);
                });
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
        return callback(null,eReports);
    })
};

exports.geteneReport = function (record,callback) {
    if(record.fromdate && record.todate)
    {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        Ereports.find({'dateTime':{$gte:moment(fdate),$lt:moment(ldate)}},function (err,result) {
            if (err) {
                return callback(err, null);
            }
            return callback(null,result);
        });
    }
    else
    {
        return callback(new Error('Please provide from date and to date both'),null);
    }

};