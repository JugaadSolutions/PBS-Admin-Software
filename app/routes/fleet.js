var express = require('express'),

    config = require('config'),
    Messages = require('../core/messages'),
    FleetService = require('../services/fleet-service');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {
        FleetService.getAllRecords(req.body,function (err,result) {
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
        FleetService.addFleet(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.FLEET_ENTRY_CREATED_SUCCESSFUL, description: '', data: result});
            }

        });
    })

;
module.exports=router;