// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var FarePlan = require('../models/fare-plan'),

    //FarePlanService = require('../services/fare-plan-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .post('/', function (req, res, next) {

       FarePlan.create(req.body,function(err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });


    })

;

module.exports = router;