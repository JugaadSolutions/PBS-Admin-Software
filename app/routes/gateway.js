/**
 * Created by root on 2/2/17.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var gateway = require('../models/gateway-response'),
    moment = require('moment'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/:id', function (req, res, next) {


        gateway.findOne({userId:req.params.id}).sort('-paymentdate').exec(function (err, result) {
                if (err) {

                    next(err, req, res, next);

                } else {

                    var response = result != null ? {
                        error: false,
                        message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                        description: '',
                        data: result
                    } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                    res.json(response);

                }

            });

    })


    .post('/', function (req, res, next) {

    var data = req.body;
        data.paymentdate = moment();
        console.log(data.paymentdate);
        gateway.create(data,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })


;

module.exports = router;

