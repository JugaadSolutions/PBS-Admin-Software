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
        RegistrationCenter.find({'stationType':'registration-center'}).deepPopulate('assignedTo').lean().exec(function (err,result) {
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

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        RegistrationCenterService.updateRegistrationcenter(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
;

module.exports = router;