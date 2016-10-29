// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var RegistrationCenter= require('../models/registration-center'),

    RegistrationCenterService = require('../services/registrationcenter-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router


    .get('/',function (req,res,next) {
        RegistrationCenter.find({'stationType':'registration-center'},function (err,result) {
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

        RegistrationCenterService.createRC(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

;

module.exports = router;