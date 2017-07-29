/**
 * Created by root on 30/6/17.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var KoneCenter= require('../models/karnatakaone-center'),

    KoneCenterService = require('../services/konecenter-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router


    .get('/',function (req,res,next) {
        KoneCenter.find({'stationType':'kone-center'}).deepPopulate('assignedTo').lean().exec(function (err,result) {
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
        if(isNaN(req.params.id))
        {
            KoneCenter.find({_id:req.params.id,'stationType':'kone-center'}).deepPopulate('assignedTo').lean().exec(function (err,result) {
                if(err)
                {
                    next(err, req, res, next);
                }
                else {
                    res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
                }
            });
        }
        else
        {
            KoneCenter.find({StationID:req.params.id,'stationType':'kone-center'}).deepPopulate('assignedTo').lean().exec(function (err,result) {
                if(err)
                {
                    next(err, req, res, next);
                }
                else {
                    res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
                }
            });
        }

    })

    .post('/', function (req, res, next) {

        KoneCenterService.createRC(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        KoneCenterService.updateKonecenter(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
;

module.exports = router;