// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var HoldingPort = require('../models/holding-port'),

    HoldingPortService = require('../services/holding-port-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {

        HoldingPort.find({'_type':'Holding-area'},function(err,result) {
            if (err) {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }
        });
    })

    .post('/', function (req, res, next) {

        HoldingPortService.createPort(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });
    })

;
module.exports = router;