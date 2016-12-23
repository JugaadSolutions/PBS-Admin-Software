/**
 * Created by root on 23/11/16.
 */

var checkinAndCheckout = require('../app/services/transaction-service');
var TransactionReconciliation = require('../app/services/transaction-reconciliation');
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
        TransactionReconciliation.ReconcileTransaction();
    });
},3000);
