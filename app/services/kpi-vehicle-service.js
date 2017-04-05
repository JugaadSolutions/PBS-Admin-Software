/**
 * Created by root on 16/1/17.
 */

var async = require('async'),
    Settings = require('../models/global-settings'),
    moment = require('moment'),
    Transactions = require('../models/transaction'),
    UsageStats = require('../models/usage-stats');

exports.createVehicleReport  = function (callback) {

    var kpidata = {
        reportDate:'',
        noOfTrips:0,
        requiredNoOfCycles:0,
        totalDuration:0,
        tripsPerCycle:0,
        durationPerCycle:0,
        noOfCyclesUsed:0,
        noOfPeopleUsed:0
    };
    async.series([
        function (callback) {
            var sdate = moment().subtract(1, 'days');
            sdate=sdate.format('YYYY-MM-DD');
            var ldate = moment();//.subtract(1, 'days');
            ldate=ldate.format('YYYY-MM-DD');
            kpidata.reportDate= sdate;
          Transactions.find({checkOutTime:{$gte:moment(sdate),$lte:moment(ldate)}},function (err,result) {
              if(err)
              {
                  return callback(err,null);
              }
              if(result.length>0)
              {
                  kpidata.noOfTrips = result.length;
                  for(var i=0;i<result.length;i++)
                  {
                      var trans = result[i];
                      kpidata.totalDuration=kpidata.totalDuration+trans.duration;
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
        }
        ,
        function (callback) {
            Settings.findOne({'name':'REQUIRED_FLEET_SIZE'},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    kpidata.requiredNoOfCycles=Number(result.value[0]);
                }
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            var sdate = moment().subtract(1, 'days');
            sdate=sdate.format('YYYY-MM-DD');
            var ldate = moment();//.subtract(1, 'days');
            ldate=ldate.format('YYYY-MM-DD');
            Transactions.find({checkOutTime:{$gt:moment(sdate),$lt:moment(ldate)}}).distinct('user').lean().exec(function (err,user) {
                if (err) {
                    return callback(err, null);
                }
                //console.log('Count Users : '+user.length);
                kpidata.noOfPeopleUsed=user.length;
                Transactions.find({checkOutTime:{$gt:moment(sdate),$lt:moment(ldate)}}).distinct('vehicle').lean().exec(function (err,vehicle) {
                    if (err) {
                        return callback(err, null);
                    }
                    //console.log('Count Users : '+vehicle.length);
                    kpidata.noOfCyclesUsed=vehicle.length;
                    return callback(null,null);

                });
            });


        },
        function (callback) {
            kpidata.tripsPerCycle = Number(kpidata.noOfTrips/kpidata.requiredNoOfCycles);
            kpidata.durationPerCycle=Number(kpidata.totalDuration/kpidata.requiredNoOfCycles);
            UsageStats.create(kpidata,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,null);
    });
};

exports.getusageReport = function (record,callback) {
    if(record.fromdate && record.todate)
    {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        UsageStats.find({'reportDate':{$gte:moment(fdate),$lte:moment(ldate)}},function (err,result) {
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