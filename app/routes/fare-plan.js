// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var FarePlan = require('../models/fare-plan'),

    //FarePlanService = require('../services/fare-plan-service'),

    RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/:id',function (req,res,next) {
        FarePlan.findOne({'_id':req.params.id},function (err,result) {
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

        FarePlan.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {

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

       FarePlan.create(req.body,function(err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });


    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        FarePlan.findByIdAndUpdate(req.params.id, existingRecord, {new: true}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .delete('/:id', function (req, res, next) {

        FarePlan.findByIdAndRemove(req.params.id, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })


;

module.exports = router;