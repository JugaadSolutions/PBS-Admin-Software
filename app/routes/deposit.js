/**
 * Created by root on 16/11/16.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var UserService = require("../services/user-service");
var PaymentTransactionService = require('../services/payment-transaction');
var Messages = require("../core/messages");

var router = express.Router();

// Router Methods
router

    .get('/', function (req, res, next) {

        PaymentTransactionService.getAllDeposits(function (err,result) {
            if (err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }
        });

    })

;

module.exports = router;