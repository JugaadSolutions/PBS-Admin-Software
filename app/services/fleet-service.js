var async = require('async'),
    Fleetarea = require('../models/fleet-area'),
    Fleet=require('../models/fleet');

exports.addFleet=function (record, callback) {

    var fleetDetails;
   async.series([
    function (callback) {
        record.portCapacity=record.VehicleCapacity;
        Fleet.create(record,function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            fleetDetails= result;
            return callback(null,result);
        });
    },
       function (callback) {
           if(fleetDetails)
           {
               Fleetarea.findOne({'_id':fleetDetails.StationId},function (err,result) {
                   if(err)
                   {
                       return callback(err,null);
                   }
                   var portDetails = {
                       dockingPortId:fleetDetails._id
                   };
                   result.portIds.push(portDetails);
                   Fleetarea.findByIdAndUpdate(result._id,result,{new:true},function (err,result) {
                       if(err)
                       {
                           return callback(err,null);
                       }
                       return callback(null,result);
                   });
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
        return callback(null,result);
    });
    
};

exports.getAllRecords=function (callback) {

    Fleet.find({'_type':'Fleet'}).deepPopulate('StationId').lean().exec(function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

};

exports.getOneRecord = function (id,callback) {
    Fleet.findById(id,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateFleetport = function (id,record,callback) {
  Fleet.findByIdAndUpdate(id,record,{new:true},function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,result);
  });
};