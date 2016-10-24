// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var RedistributionVehicle= require('../models/redistribution-vehicle'),

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

    .post('/', function (req, res, next) {

        RedistributionVehicleService.createDS(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

;

module.exports = router;