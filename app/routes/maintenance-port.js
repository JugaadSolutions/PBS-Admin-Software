// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var MaintenancePort = require('../models/maintenance-port'),

    MaintenancePortService = require('../services/maintenance-port-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {

        MaintenancePort.find({'_type':'Maintenance-area'}).deepPopulate('StationId').lean().exec(function(err,result) {
            if (err) {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }
        });
    })

    .get('/:id',function (req,res,next) {

        MaintenancePortService.getOneRecord(req.params.id,function(err,result) {
            if (err) {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }
        });
    })

    .post('/', function (req, res, next) {

        MaintenancePortService.createPort(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        MaintenancePortService.updateMaintenanceport(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

;
module.exports = router;