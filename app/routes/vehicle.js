/**
 * Created by root on 3/10/16.
 */
var express = require('express'),

    config = require('config'),
    Messages = require('../core/messages'),
    VehicleService = require('../services/vehicle-service');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {
        VehicleService.getAllRecords(req.body,function (err,result) {
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
        VehicleService.addBicycle(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});
            }

        });
    })

;
module.exports=router;