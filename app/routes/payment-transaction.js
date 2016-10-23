
var express = require('express'),

    config = require('config'),
    Messages = require('../core/messages'),
    RequestDataHandler = require('../handlers/request-data-handler'),
    PaymentTransaction = require('../models/payment-transactions'),
    VehicleService = require('../services/vehicle-service');

var router = express.Router();

// Router Methods
router

.get('/:id', function (req, res, next) {

    var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

    PaymentTransaction.findById(req.params.id).populate(appliedFilter.options.populate).exec(function (err, result) {

        if (err) {

            next(err, req, res, next);

        } else {

            var response = result != null ? {
                error: false,
                message: Messages.FETCH_RECORD_SUCCESSFUL,
                description: '',
                data: result
            } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

            res.json(response);

        }

    });

})

    .get('/', function (req, res, next) {

        var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        PaymentTransaction.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {

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

;
module.exports=router;