/**
 * Created by root on 23/11/16.
 */

var checkinAndCheckout = require('../app/services/transaction-service');
var TransactionReconciliation = require('../app/services/transaction-reconciliation');
var HourlyReport = require('../app/services/kpi-hourlyreport');
var VehicleReport = require('../app/services/kpi-vehicle-service');
var UserService = require('../app/services/user-service');
var moment = require('moment');
/*
setInterval(function () {
    console.log('Timeout');
    upload.uploader(function (err,result) {
        if(err)
        {
            console.log('Error');
            //return;
        }

        /!*
         setTimeout(function () {*!/
        /!*
         },10000);*!/
        console.log('checkout');


    });

},10000);
*/
setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
    checkinAndCheckout.timelyCheckout(function (err,result) {
        if(err)
        {
            console.log('Error');
            return;
        }
        //console.log('checkin');
        /*if(result) {
         console.log(result);
         }*/
    });
},1000);

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
    checkinAndCheckout.timelyCheckin(function (err,result) {
        if(err)
        {
            console.log('Error');
            return;
        }
        //console.log('checkin');
        /*if(result) {
            console.log(result);
        }*/
      //  TransactionReconciliation.ReconcileTransaction();
    });
},3000);

setInterval(function () {
 //setTimeout(function () {
 //console.log('Timeout');
   // TransactionReconciliation.ReconcileTransaction();
 },5000);

setInterval(function () {
    //setTimeout(function () {
    //console.log('Timeout');
    TransactionReconciliation.Associater();
},5000);

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
    TransactionReconciliation.reconse();
},3000);


/*setTimeout(function () {
//setTimeout(function () {
    //console.log('Timeout');
    UserService.ondemandcreater();
},5000);*/


/*setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
    TransactionReconciliation.syncTransaction(function (err,result) {
        if(err)
        {
            console.log('Transaction not synced');
            return;
        }
    });
},60000);*/

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
    HourlyReport.createReport(function (err,result) {
        if(err)
        {
            console.log('Error');
            return;
        }
        //console.log('checkin');
        /*if(result) {
         console.log(result);
         }*/
    });
//},5000);
},3600000);



var endDate = new Date();
endDate.setHours(6);
endDate.setMinutes(0);
endDate.setSeconds(0);
endDate.setMilliseconds(0);

var sDate = moment();
var eDate = moment(endDate).add(1,'days');
var t = moment.duration(eDate.diff(sDate));
var dur = t.asMilliseconds();
//setInterval(function () {
setTimeout(function () {
    intervalSetter();
},dur);
//},86400000);
function intervalSetter() {
    /*VehicleReport.createVehicleReport(function (err,result) {
        if(err)
        {
            console.log('Error');
            //return;
        }
    });*/
    setInterval(function () {
    //setTimeout(function () {
          /*  VehicleReport.createVehicleReport(function (err,result) {
         if(err)
         {
         console.log('Error');
         //return;
         }
         });*/
  //  },dur);
},86400000);

}
