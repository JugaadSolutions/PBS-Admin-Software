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

    .post('/', function (req, res, next) {

        DockingPortService.createPort(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

;
module.exports = router;