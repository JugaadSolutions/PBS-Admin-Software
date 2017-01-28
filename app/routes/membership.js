// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var Membership = require('../models/membership'),

    MembershipService = require('../services/membership-service'),

    RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/:id',function (req,res,next) {
    Membership.findOne({'_id':req.params.id}).deepPopulate('farePlan').lean().exec(function (err,result) {
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

        var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        Membership.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result.docs
                });

            }

        });

    })

    .post('/', function (req, res, next) {

        MembershipService.createMembership(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        MembershipService.updateMembership(req.params.id, existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .delete('/:id', function (req, res, next) {

        Membership.findByIdAndRemove(req.params.id, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

;

module.exports = router;