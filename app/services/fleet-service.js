var async = require('async'),
    Fleet=require('../models/fleet');

exports.addFleet=function (record, callback) {

/*
   async([


    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
*/
    record.portCapacity=record.VehicleCapacity;
    Fleet.create(record,function (err,result) {
    if(err)
    {
        return callback(err,null);
    }
        return callback(null,result);
    });
};

exports.getAllRecords=function (record,callback) {

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