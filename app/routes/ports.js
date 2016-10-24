// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var //DockingStation = require('../models/docking-station'),

    //RedistributionVehicleService = require('../services/redistribution-vehicle-service'),
    Ports = require('../models/port'),
//RequestDataHandler = require('../handlers/request-data-handler'),
Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router


    .get('/', function (req, res, next) {

        Ports.find({}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: 'Fetching record successful', description: '', data: result});

            }

        });
    })

;

module.exports = router;