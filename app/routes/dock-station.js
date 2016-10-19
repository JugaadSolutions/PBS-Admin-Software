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
        DockingStation.find({"stationType": "dock-station"},function (err,result) {
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

;

module.exports = router;