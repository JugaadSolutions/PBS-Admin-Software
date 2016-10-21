// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var Card = require('../models/card'),

    //MembershipService = require('../services/membership-service'),

    RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/', function (req, res, next) {

        //var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

       // Card.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {
            Card.find({}, function (err, result) {
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

        Card.create(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

;

module.exports = router;
