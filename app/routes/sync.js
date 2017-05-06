/**
 * Created by root on 21/4/17.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var Messages = require('../core/messages');
var Sync = require('../services/sync-service');

var router = express.Router();

// Router Methods
router

    .get('/userupdated',function (req,res,next) {
        Sync.getUsers(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/vehicleupdated',function (req,res,next) {
        Sync.getVehicles(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/membershipupdated',function (req,res,next) {
        Sync.getMembership(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/fareplanupdated',function (req,res,next) {
        Sync.getFarePlan(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/stationupdated',function (req,res,next) {
        Sync.getStation(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/portsupdated',function (req,res,next) {
        Sync.getPorts(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

   /* .get('/', function (req, res, next) {

        Stations.find({'stationType':{$ne:'dock-station'}}).lean().exec(function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: 'Fetching record successful', description: '', data: result});

            }

        });
    })*/

;

module.exports = router;