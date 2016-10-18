/**
 * Created by root on 3/10/16.
 */
var express = require('express'),

    config = require('config'),
    Messages = require('../core/messages'),
    MobileService = require('../services/mobile-request'),
    MemberService = require('../services/member-service');

var router = express.Router();

// Router Methods
router

    .post('/', function (req, res, next) {
        MemberService.createUser(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});
            }

        });
    })

    .post('/checkout', function (req, res, next) {
        MemberService.checkout(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.CHECK_OUT_ENTRY_CREATED, description: '', data: result});
            }

        });
    })

    .post('/checkout/app', function (req, res, next) {
        MobileService.checkoutApp(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.CHECK_OUT_ENTRY_CREATED, description: '', data: result});
            }

        });
    })

    .post('/checkin', function (req, res, next) {
        MemberService.checkin(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.CHECK_IN_ENTRY_CREATED, description: '', data: result});
            }
        });
    })
;
module.exports=router;