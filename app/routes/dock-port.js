// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var //DockingStation = require('../models/docking-station'),

    DockingPortService = require('../services/docking-port-service'),
    DockPorts = require('../models/dock-port'),
    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {
        DockPorts.find({"_type":"Docking-port"}).deepPopulate('vehicleId.vehicleid').lean().exec(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });

    })

    .get('/:id',function (req,res,next) {

        DockPorts.find({'_id':req.params.id}).deepPopulate('StationId vehicleId.vehicleid').lean().exec(function (err,result) {
            if (err) {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }
        });
    })

    .post('/', function (req, res, next) {

        DockingPortService.createPort(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        DockingPortService.updateDockport(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });
    })

;
module.exports = router;