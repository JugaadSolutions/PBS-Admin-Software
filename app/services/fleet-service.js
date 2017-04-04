var async = require('async'),
    Fleetarea = require('../models/fleet-area'),
    Station = require('../models/station'),
    Fleet=require('../models/fleet');

exports.addFleet=function (record, callback) {

    var fleetDetails;
   async.series([
       function (callback) {
           Station.findOne({StationID:record.StationId},function (err,result) {
               if(err)
               {
                   return callback(err,null);
               }
               if(!result)
               {
                   return callback(new Error('No station found by given id'),null);
               }
               record.StationId = result._id;
               return callback(null,result);
           });
       },
    function (callback) {
       // record.portCapacity=record.portCapacity;
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
               Fleetarea.findById(fleetDetails.StationId,function (err,result) {
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
        return callback(null,fleetDetails);
    });
    
};

exports.getAllRecords=function (callback) {

    Fleet.find({_type:'Fleet'}).deepPopulate('StationId').lean().exec(function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

};

exports.getOneRecord = function (id,callback) {
    Fleet.findOne({PortID:id},function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateFleetport = function (id,record,callback) {
  Fleet.findOneAndUpdate({PortID:id},record,{new:true},function (err,result) {
      if(err)
      {
          return callback(err,null);
      }
      return callback(null,result);
  });
};