/**
 * Created by root on 19/12/16.
 */
var async = require('async'),
    Constants = require('../core/constants'),
    station = require('../services/docking-station-service'),
    moment = require('moment'),
    Station = require('../models/station'),
    Tickets = require('../models/tickets'),
    cleanstation = require('../models/stationcleaning'),

    Messages = require('../core/messages'),
    kpids = require('../models/kpi-dockstation'),
    Port = require('../models/port');

exports.kpistat = function (portid,time,state) {

    var portDetails;
    var port_full=0;
    var port_empty=0;
    var stationDetails;
    async.series([
        function (callback) {
            Port.findById(portid,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error(Messages.NO_PORT_FOUND),null);
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
                if(result._type=='Docking-port')
                {
                    station.getstationdetail(result.StationId,function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        if(result)
                        {
                            stationDetails=result;
                            return callback(null,result);
                        }
                        else
                        {
                            return callback(null,null);
                        }

                    });
                }
                else
                {
                    return callback(null,result);
                }

                //}


            });
        },
        function (callback) {
            if(portDetails._type=='Docking-port')
            {

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
                            var stime = moment(result.starttime).hour();
                            var etime = moment(endtime).hour();
                            console.log('Start time : '+stime);
                            console.log('End time : '+etime);
                            if((stime>=8 && etime<11) || (stime>=16 && etime<19))
                            {
                                var durationMin = moment.duration(endtime.diff(starttime));
                                duration = durationMin.asMinutes();
                                result.peekduration = duration;
                            }
                            else if((stime<8 && etime<8) || (stime>=11 && etime<16) ||(stime>=19 && etime>=19))
                            {
                                var durationMin = moment.duration(endtime.diff(starttime));
                                duration = durationMin.asMinutes();
                                result.offpeekduration= duration;
                            }
                            else if((stime<8 && etime>=8) || (stime<16 && etime>=16))
                            {
                                /*var boundry1 = moment().set('hour', 8);
                                var boundry2 = moment().set('hour', 16);*/
                                var boundry1 = new Date();
                                boundry1.setHours(08);
                                boundry1.setMinutes(00);
                                boundry1.setSeconds(00);
                                var boundry2 = new Date();
                                boundry2.setHours(16);
                                boundry2.setMinutes(00);
                                boundry2.setSeconds(00);
                                console.log('Boundry 1 : '+boundry1);
                                console.log('Boundry 2 : '+boundry2);
                                if(stime<8)
                                {
                                    var durationMin = moment.duration(moment(boundry1).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.offpeekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry1)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.peekduration=duration2;
                                }
                                else
                                {
                                    var durationMin = moment.duration(moment(boundry2).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.offpeekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry2)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.peekduration=duration2;
                                }

                            }
                            else if((stime<11 && etime>=11) || (stime<19 && etime>=19))
                            {
                                /*var boundry1 = moment().set('hour', 11);
                                var boundry2 = moment().set('hour', 19);*/
                                var boundry1 = new Date();
                                boundry1.setHours(11);
                                boundry1.setMinutes(00);
                                boundry1.setSeconds(00);
                                var boundry2 = new Date();
                                boundry2.setHours(19);
                                boundry2.setMinutes(00);
                                boundry2.setSeconds(00);
                                console.log('Boundry 1 : '+boundry1);
                                console.log('Boundry 2 : '+boundry2);
                                if(stime<11)
                                {
                                    var durationMin = moment.duration(moment(boundry1).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.peekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry1)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.offpeekduration=duration2;
                                }
                                else
                                {
                                    var durationMin = moment.duration(moment(boundry2).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.peekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry2)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.offpeekduration=duration2;
                                }

                            }
/*                            if(moment(stime).format('h:mma').isAfter(b1) && moment(etime).format('h:mma').isBefore(e1))
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
                            var overalldurationMin = moment.duration(endtime.diff(starttime));
                            var overallduration = overalldurationMin.asMinutes();
                            result.endtime=endtime;
                            result.timeduration=overallduration;
                            result.updateStatus=1;
                            result.updatedcyclenums=stationDetails.bicycleCount;
                            //result.offpeekduration=Number(duration)/2;
                            //result.peekduration=Number(duration)-(Number(duration)/2);
                            //if(moment(starttime).format('YYYY-MM-DD')==moment(time).format('YYYY-MM-DD')) {
                                kpids.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                                    if (err) {
                                        return callback(err, null);
                                    }
                                    return callback(null, result);
                                });
                           // }
                        }
                        else
                        {
                            return callback(null,null);
                        }
                    });
                }
                if(stationDetails.bicycleCount==stationDetails.bicycleCapacity)
                    {
                    var obj={
                        stationid:stationDetails._id,
                        status:Constants.AvailabilityStatus.FULL,
                        starttime:time,
                        cyclenums:stationDetails.bicycleCount,
                        stationtype:stationDetails.modelType
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
            else
            {
                return callback(null,null);
            }
        },
        function (callback) {
            if(portDetails._type=='Docking-port')
            {

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
                            var duration;
                            var starttime = moment(result.starttime);
                            var endtime = moment(time);
                            var stime = moment(result.starttime).hour();
                            var etime = moment(endtime).hour();
                            console.log('Start time : '+stime);
                            console.log('End time : '+etime);
                            if((stime>=8 && etime<11) || (stime>=16 && etime<19))
                            {
                                var durationMin = moment.duration(endtime.diff(starttime));
                                duration = durationMin.asMinutes();
                                result.peekduration = duration;
                            }
                            else if((stime<8 && etime<8) || (stime>=11 && etime<16) ||(stime>=19 && etime>=19))
                            {
                                var durationMin = moment.duration(endtime.diff(starttime));
                                duration = durationMin.asMinutes();
                                result.offpeekduration= duration;
                            }
                            else if((stime<8 && etime>=8) || (stime<16 && etime>=16))
                            {
                                /*var boundry1 = moment().set('hour', 8);
                                 var boundry2 = moment().set('hour', 16);*/
                                var boundry1 = new Date();
                                boundry1.setHours(8);
                                boundry1.setMinutes(0);
                                boundry1.setSeconds(0);
                                var boundry2 = new Date();
                                boundry2.setHours(16);
                                boundry2.setMinutes(0);
                                boundry2.setSeconds(0);
                                console.log('Boundry 1 : '+boundry1);
                                console.log('Boundry 2 : '+boundry2);
                                if(stime<8)
                                {
                                    var durationMin = moment.duration(moment(boundry1).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.offpeekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry1)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.peekduration=duration2;
                                }
                                else
                                {
                                    var durationMin = moment.duration(moment(boundry2).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.offpeekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry2)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.peekduration=duration2;
                                }

                            }
                            else if((stime<11 && etime>=11) || (stime<19 && etime>=19))
                            {
                                /*var boundry1 = moment().set('hour', 11);
                                 var boundry2 = moment().set('hour', 19);*/
                                var boundry1 = new Date();
                                boundry1.setHours(11);
                                boundry1.setMinutes(0);
                                boundry1.setSeconds(0);
                                var boundry2 = new Date();
                                boundry2.setHours(19);
                                boundry2.setMinutes(0);
                                boundry2.setSeconds(0);
                                console.log('Boundry 1 : '+boundry1);
                                console.log('Boundry 2 : '+boundry2);
                                if(stime<11)
                                {
                                    var durationMin = moment.duration(moment(boundry1).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.peekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry1)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.offpeekduration=duration2;
                                }
                                else
                                {
                                    var durationMin = moment.duration(moment(boundry2).diff(starttime));
                                    duration = durationMin.asMinutes();
                                    result.peekduration = duration;
                                    var durationMin2 = moment.duration(endtime.diff(moment(boundry2)));
                                    var duration2 = durationMin2.asMinutes();
                                    result.offpeekduration=duration2;
                                }

                            }

                            /*                            if(moment(stime).format('h:mma').isAfter(b1) && moment(etime).format('h:mma').isBefore(e1))
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

                            var overalldurationMin = moment.duration(endtime.diff(starttime));
                            var overallduration = overalldurationMin.asMinutes();
                            result.endtime=endtime;
                            result.timeduration=overallduration;
                            result.updateStatus=1;
                            result.updatedcyclenums=stationDetails.bicycleCount;
                            //result.offpeekduration=Number(duration)/2;
                            //result.peekduration=Number(duration)-(Number(duration)/2);
                            //if(moment(starttime).format('YYYY-MM-DD')==moment(time).format('YYYY-MM-DD')) {
                            kpids.findByIdAndUpdate(result._id, result, {new: true}, function (err, result) {
                                if (err) {
                                    return callback(err, null);
                                }
                                return callback(null, result);
                            });
                        }
                        else
                        {
                            return callback(null,null);
                        }
                    });
                }
                if(stationDetails.bicycleCount==0)
                {
                    var obj={
                        stationid:stationDetails._id,
                        status:Constants.AvailabilityStatus.EMPTY,
                        starttime:time,
                        cyclenums:stationDetails.bicycleCount,
                        stationtype:stationDetails.modelType
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

   if(record.fromdate && record.todate)
   {
       if(record.stationState==0)
       {
           var fdate = moment(record.fromdate);
           fdate=fdate.format('YYYY-MM-DD');
           var ldate = moment(record.todate).add(1, 'days');
           ldate=ldate.format('YYYY-MM-DD');
           kpids.find({'starttime':{$gte:moment(fdate),$lte:moment(ldate)},'timeduration':{$gte:record.duration},'updateStatus':1}).deepPopulate('stationid').lean().exec(function (err,result) {
               if(err)
               {
                   return callback(err,null);
               }
               return callback(null,result);
           });
       }else
       {
           var fdate = moment(record.fromdate);
           fdate=fdate.format('YYYY-MM-DD');
           var ldate = moment(record.todate).add(1, 'days');
           ldate=ldate.format('YYYY-MM-DD');
           if(record.stationState==1) {
               stat = 1;
           }
           else
           {
               stat=2;
           }
           kpids.find({'starttime':{$gte:moment(fdate),$lte:moment(ldate)},'timeduration':{$gte:record.duration},'status':stat,'updateStatus':1}).deepPopulate('stationid').lean().exec(function (err,result) {
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
       return callback(new Error('Please provide from date and to date both'),null);
   }


};

exports.kpicleaninfo = function (record,callback) {
    if(record.fromdate && record.todate)
    {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        cleanstation.find({'cleaneddate':{$gte:moment(fdate),$lte:moment(ldate)},'cleanCount':1}).sort({'cleaneddate': 'ascending'}).deepPopulate('stationId empId').lean().exec(function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        return callback(new Error('Please provide from date and to date both'),null);
    }
};

exports.kpiTicketsinfo = function (record,callback) {
    if(record.fromdate && record.todate)
    {
        var fdate = moment(record.fromdate);
        fdate=fdate.format('YYYY-MM-DD');
        var ldate = moment(record.todate).add(1, 'days');
        ldate=ldate.format('YYYY-MM-DD');
        if(record.complaintType==0)
        {
            Tickets.find({'ticketdate':{$gte:moment(fdate),$lte:moment(ldate)}}).sort({'ticketdate': 'ascending'}).deepPopulate('user assignedEmp createdBy transactions.replierId').lean().exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
        else
        {
            Tickets.find({'ticketdate':{$gte:moment(record.fromdate),$lte:moment(ldate)},'complaintType':Number(record.complaintType)}).sort({'ticketdate': 'ascending'}).deepPopulate('user assignedEmp createdBy transactions.replierId').lean().exec(function (err,result) {
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
        return callback(new Error('Please provide from date and to date both'),null);
    }
};