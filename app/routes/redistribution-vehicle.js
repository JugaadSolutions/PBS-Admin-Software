// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var RedistributionVehicle= require('../models/redistribution-area'),

    RedistributionVehicleService = require('../services/redistribution-vehicle-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router


    .get('/',function (req,res,next) {
        RedistributionVehicle.find({'stationType':'redistribution-vehicle'},function (err,result) {
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
        RedistributionVehicle.find({'_id':req.params.id},function (err,result) {
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

        RedistributionVehicleService.createDS(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        RedistributionVehicleService.updateRedistributionVehicle(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
;

module.exports = router;