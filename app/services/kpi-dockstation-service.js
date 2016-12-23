/**
 * Created by root on 19/12/16.
 */
var async = require('async'),
    Constants = require('../core/constants'),
    station = require('../services/docking-station-service'),
    moment = require('moment'),
    Station = require('../models/station'),
    cleanstation = require('../models/stationcleaning'),
    kpids = require('../models/kpi-dockstation'),
    Port = require('../models/port');

exports.kpistat = function (portid,time,state) {

    var portDetails;
    var port_full=0;
    var port_empty=0;
    var stationDetails;
    var b1=moment('8:00am','h:mma');
    var e1=moment('10:00am','h:mma');
    var b2=moment('4:00pm','h:mma');
    var e2=moment('7:00pm','h:mma');
    async.series([
        function (callback) {
            Port.findOne({'_id':portid},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
               /* if(result.StationId)
                {*/
                    /*Station.findOne({'_id':result.StationId},function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        stationDetails=result;
                    });*/
                portDetails=result;
                    station.getstationdetail(result.StationId,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        stationDetails=result;
                        return callback(null,result);
                    });
                //}


            });
        },
        function (callback) {
            if(state==1)
            {
                if(stationDetails.bicycleCount==1)
                {
                    kpids.findOne({'stationid':stationDetails._id,'status':Constants.AvailabilityStatus.EMPTY,'updateStatus':0},function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        if(result)
                        {
                            var duration;
                            var starttime = moment(result.starttime);
                            var endtime = moment(time);
                            /*var stime = moment(result.starttime).format('HH');
                            var etime = moment(endtime).format('HH');
                            console.log('Start time : '+stime);
                            console.log('End time : '+etime);
                            if(stime>08 && etime<11 || stime>16 && etime<19)
                            {
                                console.log('stime inbetween');
                            }*/
                           /* if(moment(stime).format('h:mma').isAfter(b1) && moment(etime).format('h:mma').isBefore(e1))
                            {
                                var durationMin = moment.duration(endtime.diff(starttime));
                                duration = durationMin.asMinutes();
                                result.peekduration = duration;
                            }
                            else if(moment(stime).format('h:mma').isAfter(b2) && moment(etime).format('h:mma').isBefore(e2))
                            {
                                var durationMin = moment.duration(endtime.diff(starttime));
                                duration = durationMin.asMinutes();
                                result.peekduration = duration;
                            }
                            else //if(stime.isBetween('8:00:00 pm','11:00:00 pm') && etime.isBetween('4:00:00 pm','7:00:00 pm'))
                            {
                                var durationMin = moment.duration(endtime.diff(starttime));
                                duration = durationMin.asMinutes();
                                result.offpeekduration=duration;
                            }*/

                            var durationMin = moment.duration(endtime.diff(starttime));
                            duration = durationMin.asMinutes();
                            result.endtime=time;
                            result.timeduration=duration;
                            result.updateStatus=1;
                            result.updatedcyclenums=stationDetails.bicycleCount;
                            result.offpeekduration=Number(duration)/2;
                            result.peekduration=Number(duration)-(Number(duration)/2);
                            //if(moment(starttime).format('YYYY-MM-DD')==moment(time).format('YYYY-MM-DD')) {
                                kpids.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                                    if (err) {
                                        return callback(err, null);
                                    }
                                    return callback(null, result);
                                });
                           // }
                        }
                    });
                }
                if(stationDetails.bicycleCount==stationDetails.bicycleCapacity)
                {
                    var obj={
                        stationid:stationDetails._id,
                        status:Constants.AvailabilityStatus.FULL,
                        starttime:time,
                        cyclenums:stationDetails.bicycleCount
                    };
                    kpids.create(obj,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(state==2)
            {
                if(stationDetails.bicycleCount==stationDetails.bicycleCapacity-1)
                {
                    kpids.findOne({'stationid':stationDetails._id,'status':Constants.AvailabilityStatus.FULL,'updateStatus':0},function (err, result) {
                        if (err) {
                            return callback(err, null);
                        }
                        if(result)
                        {
                            var starttime = moment(result.starttime);
                            var endtime = moment(time);
                            var durationMin = moment.duration(endtime.diff(starttime));
                            var duration = durationMin.asMinutes();
                            result.endtime=time;
                            result.timeduration=duration;
                            result.updateStatus=1;
                            result.updatedcyclenums=stationDetails.bicycleCount;
                            if(moment(starttime).format('YYYY-MM-DD')==moment(time).format('YYYY-MM-DD')) {
                                kpids.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                                    if (err) {
                                        return callback(err, null);
                                    }
                                    return callback(null, result);
                                });
                            }
                        }
                    });
                }
                if(stationDetails.bicycleCount==0)
                {
                    var obj={
                        stationid:stationDetails._id,
                        status:Constants.AvailabilityStatus.EMPTY,
                        starttime:time,
                        cyclenums:stationDetails.bicycleCount
                    };
                    kpids.create(obj,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        }
        /*,
        function (callback) {
           if(portDetails._type=='Docking-port')
           {
               Port.find({'StationId':portDetails.StationId},function (err,result) {
                   if(err)
                   {
                       return callback(err,null);
                   }
                   if(result)
                   {
                       for (var i=0;i<result.length;i++)
                       {
                           if(result[i].portStatus==Constants.AvailabilityStatus.EMPTY)
                           {
                               port_empty=port_empty+1;
                           }
                           if(result[i].portStatus==Constants.AvailabilityStatus.FULL)
                           {
                               port_full = port_full+1;
                           }
                       }
                   }

                   return callback(null,result);
               });
           }
           else
           {
               return callback(null,null);
           }
        }*//*,function (callback) {
            if(port_empty==stationDetails.noofPorts)
            {
                kpids.findOne({'stationid':stationDetails._id,'status':Constants.AvailabilityStatus.FULL},function (err, result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        var obj={
                            stationid:stationDetails._id,
                            status:Constants.AvailabilityStatus.EMPTY,
                            starttime:new Date(),
                            cyclenums:port_full
                        };
                        kpids.create(obj,function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            return callback(null,result);
                        });
                    }
                    if(result)
                    {
                        var time = new Date();
                        var starttime = moment(result.starttime);
                        var endtime = moment(time);
                        var durationMin = moment.duration(endtime.diff(starttime));
                        var duration = durationMin.asMinutes();
                        result.endTime=time;
                        result.timeduration=duration;
                        result.cyclenums=port_full;
                        kpids.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            if(result)
                            {
                                var obj={
                                    stationid:stationDetails._id,
                                    status:Constants.AvailabilityStatus.EMPTY,
                                    starttime:new Date(),
                                    cyclenums:port_full
                                };
                                kpids.create(obj,function (err,result) {
                                    if(err)
                                    {
                                        return callback(err,null);
                                    }
                                    return callback(null,result);
                                });
                            }
                            //return callback(null,result);
                        });
                    }
                });
            }
            else
            {
                return callback(null,null);
            }

        },function (callback) {
            if(port_full==1)
            {
                kpids.findOne({'stationid':stationDetails._id,'status':Constants.AvailabilityStatus.EMPTY},function (err, result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    if(!result)
                    {
                        var obj={
                            stationid:stationDetails._id,
                            status:Constants.AvailabilityStatus.FULL,
                            starttime:new Date(),
                            cyclenums:port_empty
                        };
                        kpids.create(obj,function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            return callback(null,result);
                        });
                    }
                    if(result)
                    {
                        var time = new Date();
                        var starttime = moment(result.starttime);
                        var endtime = moment(time);
                        var durationMin = moment.duration(endtime.diff(starttime));
                        var duration = durationMin.asMinutes();
                        result.endtime=time;
                        result.timeduration=duration;
                        result.cyclenums=port_full;
                        kpids.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                            if(result)
                            {
                                var obj={
                                    stationid:stationDetails._id,
                                    status:Constants.AvailabilityStatus.FULL,
                                    starttime:new Date(),
                                    cyclenums:port_empty
                                };
                                kpids.create(obj,function (err,result) {
                                    if(err)
                                    {
                                        return callback(err,null);
                                    }
                                    return callback(null,result);
                                });
                            }

                           // return callback(null,result);
                        });
                    }
                });
            }
            else
            {
                return callback(null,null);
            }

        }*/
    ],function (err,result) {
        if(err)
        {
            return console.error('KPI-docking service : '+err );
        }
    });
};

exports.kpistatinfo= function (record,callback) {
/*    async.series([
        function (callback) {
            kpids.find();
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    })*/
    var stat=0;
    var alldata=[];
   /* if(record.peek==1)
    {
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        if(record.stationState==1)
            stat=1;
        else stat=2;
        kpids.find({'starttime':{$gte:moment(record.fromdate),$lte:moment(ldate)},'timeduration':{$gte:record.duration},'status':stat,'updateStatus':1}).deepPopulate('stationid').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
                for(var i=0;i<result.length;i++)
                {
                    if(moment(result[i].starttime).isBetween(moment(result[i].endtime)))
                    {

                    }
                }
            return callback(null,result);
        });
    }else {

    }*/
    if(record.stationState==0)
    {
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        kpids.find({'starttime':{$gte:moment(record.fromdate),$lte:moment(ldate)},'timeduration':{$gte:record.duration},'updateStatus':1}).deepPopulate('stationid').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }else
    {
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        if(record.stationState==1) {
            stat = 1;
        }
        else
        {
            stat=2;
        }
        kpids.find({'starttime':{$gte:moment(record.fromdate),$lte:moment(ldate)},'timeduration':{$gte:record.duration},'status':stat,'updateStatus':1}).deepPopulate('stationid').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }

};

exports.kpicleaninfo = function (record,callback) {

    var ldate = moment(record.todate).add(1, 'days');
    ldate=ldate.format('YYYY-MM-DD');
    cleanstation.find({'cleaneddate':{$gte:moment(record.fromdate),$lte:moment(ldate)}}).sort({'cleaneddate': 'ascending'}).deepPopulate('stationId empId').lean().exec(function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};