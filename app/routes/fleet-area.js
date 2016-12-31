// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var //DockingStation = require('../models/docking-station'),

    FleetAreaService = require('../services/fleet-area-service'),
    FleetArea = require('../models/fleet-area'),
    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {
        FleetArea.find({'stationType':'fleet-area'},function (err,result) {
            if (err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }
        });

    })

    .get('/:id',function (req,res,next) {
        FleetArea.find({'_id':req.params.id,'stationType':'fleet-area'},function (err,result) {
            if (err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }
        });

    })

    .post('/', function (req, res, next) {

        FleetAreaService.createDS(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        FleetArea.findByIdAndUpdate(req.params.id,existingRecord,{new:true}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

;

module.exports = router;