/**
 * Created by root on 6/10/16.
 */
// Third Party Dependencies
var async = require('async'),
    RedistributionPort = require('../models/redistribution-port')
    /*config = require('config'),
     request = require('request')*/;
var RedistributionVehicle=require('../models/redistribution-area');



exports.createDS = function (record,callback) {
    var redistributionDetails;
    //var redistributionportDetails;


    async.series([

        function (callback) {
            var rv= {
                name:record.name
                /*vehiclePlate:record.vehiclePlate,
                driverId:record.driverId*/
            };
            RedistributionVehicle.create(rv,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                redistributionDetails=result;
                return callback(null,result);
            });
        }/*,
        function (callback) {
            var rp={
                StationId:redistributionDetails._id,
                portCapacity:record.portCapacity,
                Name:record.Name
            };
            RedistributionPort.create(rp,function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                redistributionportDetails=result;
                return callback(null,result);
            });

        }
*/

    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });


};

exports.updateRedistributionVehicle =function (id,record,callback) {
  RedistributionVehicle.findByIdAndUpdate(id,record,{new:true},function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,result);
  });
};
