/**
 * Created by root on 15/1/17.
 */
var async = require('async'),
    kpiHourly = require('../models/kpi-hourlyreport'),
    moment = require('moment'),
    Constants = require('../core/constants'),
    Users = require('../models/user'),
    Checkout = require('../models/checkout'),
    Settings = require('../models/global-settings'),
    Ports = require('../models/port');

exports.createReport = function (callback) {
    var kpi={
        cyclesInPort:0,
        cyclesWithUsers:0,
        cyclesWithMembers:0,
        cyclesWithEmployees:0,
        cyclesWithRv:0,
        cyclesWithMa:0,
        cyclesWithHa:0,
        nonWorkingPort:0,
        emptyPort:0,
        requiredFleetSize:0
    };

    async.series([
        function (callback) {
            Users.find({_type:'member',smartCardNumber:{$ne:''}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        var Member = result[i];
                        if(Member.vehicleId.length>0)
                        {
                            kpi.cyclesWithMembers=kpi.cyclesWithMembers+1;
                        }
                        if(i==result.length-1)
                        {
                            return callback(null,result);
                        }
/*                        if(Member.status==Constants.MemberStatus.REGISTERED || Member.status==Constants.MemberStatus.RENEWED)
                        {
                            var validity = moment(Member.validity);
                            var current = moment();
                            var days = moment.duration(validity.diff(current));
                            var duration = days.asDays();
                            if(duration<0)
                            {
                                Users.findByIdAndUpdate(Member._id,{$set:{status:Constants.MemberStatus.EXPIRED}},function (err,result) {
                                    if(err)
                                    {
                                        console.error('Error while updating user expiry KPI report hourly report service : '+err);
                                    }
                                });
                            }
                        }*/
                    }
                }
                else
                {
                    return callback(null,null);
                }
            });
        },
        function (callback) {
            Users.find({_type:{$ne:'member'},smartCardNumber:{$ne:''}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        var User = result[i];
                        if(User.vehicleId.length>0)
                        {
                            kpi.cyclesWithEmployees=kpi.cyclesWithEmployees+User.vehicleId.length;
                        }
                        if(i==result.length-1)
                        {
                            return callback(null,result);
                        }
                    }
                }
            });
        },
        function (callback) {
            Ports.find({},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    for(var i=0;i<result.length;i++)
                    {
                        var port = result[i];
                        if(port._type=='Docking-port')
                        {
                            if(port.portStatus==Constants.AvailabilityStatus.EMPTY)
                            {
                                kpi.emptyPort=kpi.emptyPort+1;
                            }
                            else if(port.portStatus==Constants.AvailabilityStatus.FULL)
                            {
                                kpi.cyclesInPort=kpi.cyclesInPort+1;
                            }
                            else if(port.portStatus==Constants.AvailabilityStatus.ERROR)
                            {
                                kpi.nonWorkingPort=kpi.nonWorkingPort+1;
                            }
                        }
                        else if(port._type=='Maintenance-area')
                        {
                            kpi.cyclesWithMa = kpi.cyclesWithMa+port.vehicleId.length;
                        }
                        else if(port._type=='Holding-area')
                        {
                            kpi.cyclesWithHa = kpi.cyclesWithHa+port.vehicleId.length;
                        }
                        else if(port._type=='Redistribution-vehicle')
                        {
                            kpi.cyclesWithRv = kpi.cyclesWithRv+port.vehicleId.length;
                        }
                        if(i==result.length-1)
                        {
                            return callback(null,result);
                        }
                    }
                }
            });
        },
        function (callback) {
            Settings.findOne({'name':'REQUIRED_FLEET_SIZE'},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    kpi.requiredFleetSize=Number(result.value[0]);
                }
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            kpi.cyclesWithUsers = kpi.cyclesWithEmployees+kpi.cyclesWithMembers;
            kpiHourly.create(kpi,function (err,result) {
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

exports.getReport = function (record,callback) {

    var allReports = [];
    if(record.duration==25)
    {
        kpiHourly.find({'dateAndTime':{$gte:moment(fdate),$lte:moment(ldate)/*,$gt:[{$hour:'$dateAndTime'},6]*/}},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
                return callback(null,result);
        });
    }
    else if(record.duration==0)
    {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        kpiHourly.find({'dateAndTime':{$gte:moment(fdate),$lte:moment(ldate)/*,$gt:[{$hour:'$dateAndTime'},6]*/}},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            if(result.length>0)
            {
                for(var i=0;i<result.length;i++)
                {
                    var report = result[i];
  //                  console.log('Hours : '+moment(report.dateAndTime).get('h'));
                    if(moment(report.dateAndTime).get('h')==6)
                    {
                        allReports.push(report);
                    }
                    if(i==result.length-1)
                    {
                        return callback(null,allReports);
                    }
                }
            }
            else
            {
                return callback(null,result);
            }

        });
    }
    else {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        kpiHourly.find({'dateAndTime':{$gte:moment(fdate),$lte:moment(ldate)/*,$gt:[{$hour:'$dateAndTime'},6]*/}},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            if(result.length>0)
            {
                for(var i=0;i<result.length;i++)
                {
                    var report = result[i];
                    console.log('Hours : '+moment(report.dateAndTime).get('h'));
                    if(moment(report.dateAndTime).get('h')==record.duration+5)
                    {
                        allReports.push(report);
                    }
                    if(i==result.length-1)
                    {
                        return callback(null,allReports);
                    }
                }
            }
            else
            {
                return callback(null,result);
            }

        });
    }
};

exports.getcardReport = function (record,callback) {
    if(record.duration==0)
    {
        record.duration=1;
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
            Checkout.count({checkOutTime:{$gte:moment(fdate),$lte:moment(ldate)},duration:{$lte:Number(record.duration)}},function (err,result) {
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
            Checkout.count({checkOutTime:{$gte:moment(fdate),$lte:moment(ldate)}},function (err,result) {
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
