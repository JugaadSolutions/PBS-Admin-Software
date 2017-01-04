/**
 * Created by root on 3/10/16.
 */
var express = require('express'),

    config = require('config'),
    Messages = require('../core/messages'),
    Vehicles = require('../models/vehicle'),
    VehicleService = require('../services/vehicle-service');

var router = express.Router();

// Router Methods
router


    .get('/:id',function (req,res,next) {
        Vehicles.findOne({'_id':req.params.id},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

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

    .get('/availability',function (req,res,next) {
        VehicleService.checkVehicleAvailability(function (err,result) {
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

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        VehicleService.updateVehicle(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

;
module.exports=router;