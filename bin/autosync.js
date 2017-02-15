/**
 * Created by root on 9/1/17.
 */

var syncService=require('../app/services/sync-service');

var flag = 1;
var lastSyncedTime;
setTimeout(function () {
    usersync();
},10);

setTimeout(function () {
    vehiclesync();
},15);

function usersync() {
    setTimeout(function () {
        //console.log('Timeout');
/*        if(flag==1)
        {
            flag = 0;*/
            syncService.startUserSync(function (err,result) {
                if(err)
                {
                    console.log('Error');
                    usersync();
                    return;
                }
                if(result)
                {
                    console.log('User Sync done once');
                    usersync();
                }

            });
  //      }
/*        else
        {
            //lastSyncedTime = new Date();
            syncService.startUserSync(lastSyncedTime,function (err,time,result) {
                if(err)
                {
                    console.log('Error');
                    return;
                }
                if(result)
                {
                    lastSyncedTime=time;
                    console.log('User Sync done once');
                     usersync();
                }

            });
        }*/

    },30000);
}

function vehiclesync() {
    setTimeout(function () {
        //console.log('Timeout');
        syncService.startVehicleSync(function (err,result) {
            if(err)
            {
                console.log('Error');
                vehiclesync();
                return;
            }
            if(result)
            {
                console.log('Vehicle Sync done once');
                vehiclesync();
            }

        });
    },51313);
}
//setInterval(function () {
