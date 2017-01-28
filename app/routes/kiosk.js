/**
 * Created by root on 17/1/17.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var kiosk = require('../models/kiosk'),
    kioskservice = require('../services/kiosk-service'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/:id',function (req,res,next) {
        kiosk.findOne({'_id':req.params.id},function (err,result) {
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

        kiosk.find({},function (err, result) {
            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                });

            }

        });

    })

    .post('/', function (req, res, next) {

        kioskservice.createKiosktransaction(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        kiosk.findByIdAndUpdate(req.params.id, existingRecord, {new: true}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })


;

module.exports = router;
