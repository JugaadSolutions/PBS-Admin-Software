/**
 * Created by root on 15/1/17.
 */
var moment = require('moment'),
    Constants=require('../app/core/constants'),
    kpids = require('../app/models/kpi-dockstation');

kpids.find({},function (err, result) {
    if (err) {
        return console.log('Error kpids');
    }
    if (result) {
        for (var i = 0; i < result.length; i++) {

        var duration;
        var starttime = moment(result[i].starttime);
        var endtime = moment(result[i].endtime);
        var stime = moment(result[i].starttime).hour();
        var etime = moment(endtime).hour();
        console.log('Start time : ' + stime);
        console.log('End time : ' + etime);
        if ((stime >= 8 && etime <= 11) || (stime >= 16 && etime <= 19)) {
            var durationMin = moment.duration(endtime.diff(starttime));
            duration = durationMin.asMinutes();
            result[i].peekduration = duration;
        }
        else if ((stime <= 8 && etime <= 8) || (stime >= 11 && etime <= 16) || (stime >= 19 && etime >= 19)) {
            var durationMin = moment.duration(endtime.diff(starttime));
            duration = durationMin.asMinutes();
            result[i].offpeekduration = duration;
        }
        else if ((stime <= 8 && etime >= 8) || (stime <= 16 && etime >= 16)) {
            /*var boundry1 = moment().set('hour', 8);
             var boundry2 = moment().set('hour', 16);*/
/*            var boundry1 = new Date;
            boundry1.setHours(8);
            var boundry2 = new Date;
            boundry2.setHours(16);*/
            console.log('Boundry 1 : ' + boundry1);
            console.log('Boundry 2 : ' + boundry2);
            if (stime <= 8) {
                var durationMin = moment.duration(endtime .diff(starttime));
                duration = durationMin.asMinutes();
                result[i].offpeekduration = duration;
                var durationMin2 = moment.duration(endtime.diff(boundry1));
                var duration2 = durationMin2.asMinutes();
                result[i].peekduration = duration2;
            }
            else {
                var durationMin = moment.duration(boundry2.diff(starttime));
                duration = durationMin.asMinutes();
                result[i].offpeekduration = duration;
                var durationMin2 = moment.duration(endtime.diff(boundry2));
                var duration2 = durationMin2.asMinutes();
                result[i].peekduration = duration2;
            }

        }
        else if ((stime <= 11 && etime >= 11) || (stime <= 19 && etime >= 19)) {
            /*var boundry1 = moment().set('hour', 11);
             var boundry2 = moment().set('hour', 19);*/
            var boundry1 = new Date();
            boundry1.setHours(8);
            var boundry2 = new Date();
            boundry2.setHours(16);
            console.log('Boundry 1 : ' + boundry1);
            console.log('Boundry 2 : ' + boundry2);
            if (stime <= 11) {
                var durationMin = moment.duration(boundry1.diff(starttime));
                duration = durationMin.asMinutes();
                result[i].peekduration = duration;
                var durationMin2 = moment.duration(endtime.diff(boundry1));
                var duration2 = durationMin2.asMinutes();
                result[i].offpeekduration = duration2;
            }
            else {
                var durationMin = moment.duration(boundry2.diff(starttime));
                duration = durationMin.asMinutes();
                result[i].peekduration = duration;
                var durationMin2 = moment.duration(endtime.diff(boundry2));
                var duration2 = durationMin2.asMinutes();
                result[i].offpeekduration = duration2;
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
        result[i].endtime = endtime;
        result[i].timeduration = overallduration;
        result[i].updateStatus = 1;
        //result.updatedcyclenums = stationDetails.bicycleCount;
        //result.offpeekduration=Number(duration)/2;
        //result.peekduration=Number(duration)-(Number(duration)/2);
        //if(moment(starttime).format('YYYY-MM-DD')==moment(time).format('YYYY-MM-DD')) {
        kpids.findByIdAndUpdate(result[i]._id, result[i], {new: true}, function (err, result) {
            if (err) {
                return console.error('Error Update : ' + err);
            }
            console.log('done');
        });
        // }
    }
}
});
