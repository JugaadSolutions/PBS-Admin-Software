// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var Membership = require('../models/membership'),

    //MembershipService = require('../services/membership-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {
    Membership.find({},function (err,result) {
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

    Membership.create(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

;

module.exports = router;