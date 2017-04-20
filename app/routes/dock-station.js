// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var DockingStation = require('../models/dock-station'),

    DockingStationService = require('../services/docking-station-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {
        DockingStationService.getAllStations(req.body,function (err,result) {
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
        if(isNaN(req.params.id))
        {
            DockingStation.findOne({_id:req.params.id},function (err,result) {
                if(err)
                {
                    next(err, req, res, next);
                }
                else {
                    res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
                }
            });
        }
        else
        {
            DockingStation.findOne({StationID:req.params.id},function (err,result) {
                if(err)
                {
                    next(err, req, res, next);
                }
                else {
                    res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
                }
            });
        }
    })
    .get('/:id/cleanstation',function (req,res,next) {
        DockingStationService.getcleanStationsById(req.params.id,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {

                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }
        });

    })

    .post('/cleanstation/info',function (req,res,next) {
        DockingStationService.getCleanedstatrec(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {

                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }
        });

    })

    .post('/', function (req, res, next) {

        DockingStationService.createDS(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

    .post('/cleanstation', function (req, res, next) {

        DockingStationService.createCleanedEntry(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })


    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        DockingStationService.updateDockstation(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
;

module.exports = router;