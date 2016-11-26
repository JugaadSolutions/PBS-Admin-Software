// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var //DockingStation = require('../models/docking-station'),

    //RedistributionVehicleService = require('../services/redistribution-vehicle-service'),
    Stations = require('../models/station');
    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/:id',function (req,res,next) {
        Stations.findOne({'_id':req.params.id},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/', function (req, res, next) {

        Stations.find({}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: 'Fetching record successful', description: '', data: result});

            }

        });
    })

;

module.exports = router;