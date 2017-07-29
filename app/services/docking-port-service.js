// Third Party Dependencies
var async = require('async');

// Application Level Dependencies
var //DockingUnitService = require('../services/docking-unit-service'),

    //RequestHandler = require('../handlers/request-handler'),
    DockPort = require('../models/dock-port'),
    Messages = require('../core/messages');

// Method to create Docking Port
/* ***************************** With Inheritence ************************ */

exports.createPort=function (record,callback) {
    DockPort.create(record,function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.updateDockport=function (id,record,callback) {
    if(isNaN(id))
    {
        DockPort.findByIdAndUpdate(id,{$set:{'portStatus':record.portStatus,'lastModifiedAt':new Date()}},{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }
    else
    {
        DockPort.findOneAndUpdate(id,{$set:{'portStatus':record.portStatus,'lastModifiedAt':new Date()}},{new:true},function (err,result) {
            if(err)
            {
                return callback(err,null);
            }
            return callback(null,result);
        });
    }

};