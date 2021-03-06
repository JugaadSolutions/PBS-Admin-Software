/**
 * Created by root on 3/10/16.
 */
var express = require('express'),

    config = require('config'),
    Messages = require('../core/messages'),
    Transaction = require('../models/transaction'),
    CheckOut = require('../models/checkout'),
    MobileService = require('../services/mobile-request'),
    BridgeService = require('../services/bridge-service'),
    TransactionService = require('../services/transaction-service');

var router = express.Router();

// Router Methods
router

    .get('/myrides/member/:memberId', function (req, res, next) {

        TransactionService.getFewRecordsWRTMember(req.params.memberId, 1,function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                var response = result != null ? {
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                res.json(response);

            }

        });

    })

    .get('/myrides/card/:cardId', function (req, res, next) {

        TransactionService.getFewRecordsWRTMember(req.params.cardId, 2,function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                var response = result != null ? {
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                res.json(response);

            }

        });

    })

    .get('/myrides/all/:cardId', function (req, res, next) {

        TransactionService.getRecordsWRTMember(req.params.cardId,function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                var response = result != null ? {
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                res.json(response);

            }

        });

    })

    .get('/',function (req,res,next) {
        TransactionService.getAllTransactions(function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                var response = result != null ? {
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                res.json(response);

            }

        });
    })
    .get('/all',function (req,res,next) {
        Transaction.find({}).sort({'createdAt': -1}).deepPopulate('user vehicle fromPort toPort').lean().exec(function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                var response = result != null ? {
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                res.json(response);

            }

        });
    })
    .get('/checkout/card/:id',function (req,res,next) {
        TransactionService.getOpenCheckouts(req.params.id,function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                var response = result != null ? {
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                res.json(response);

            }

        });
    })
    .get('/checkin',function (req,res,next) {
        TransactionService.getAllcheckins(function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                var response = result != null ? {
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                res.json(response);

            }

        });
    })

    .post('/completed', function (req, res, next) {

        TransactionService.getAllCompletedTransactions(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message:  Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }

        });
    })

/*    .post('/', function (req, res, next) {
        TransactionService.createUser(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});
            }

        });
    })*/

    .post('/checkout', function (req, res, next) {
        TransactionService.checkout(req.body,function (err,result) {
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

    .post('/checkout/bridge', function (req, res, next) {
        BridgeService.BridgeCheckout(req.body,function (err,result) {
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

    .post('/checkin/bridge', function (req, res, next) {
        BridgeService.BridgeCheckin(req.body,function (err,result) {
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

    .post('/checkin/app', function (req, res, next) {
        MobileService.checkinApp(req.body,function (err,result) {
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


    .post('/checkin', function (req, res, next) {
        TransactionService.checkin(req.body,function (err,result) {
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


    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        Transaction.findByIdAndUpdate(req.params.id, existingRecord, {new: true}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .delete('/:id', function (req, res, next) {

        TransactionService.clearOpenCheckout(req.params.id, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .delete('/checkin/:id', function (req, res, next) {

        TransactionService.clearOpenCheckin(req.params.id, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
    .delete('/checkout/all', function (req, res, next) {

        TransactionService.clearAllOpenCheckout(function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .delete('/checkin/clear/open', function (req, res, next) {

        TransactionService.clearAllOpenCheckin( function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .delete('/duplicate/info', function (req, res, next) {

        TransactionService.clearDuplicate(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
    .delete('/correction/:id', function (req, res, next) {

         Transaction.findByIdAndRemove(req.params.id, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });
    })

    .delete('/clear/checkout/cc', function (req, res, next) {

        TransactionService.clearOpenCheckoutFromControlCenter(req.body,function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
;
module.exports=router;