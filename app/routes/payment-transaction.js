
var express = require('express'),
    moment = require('moment'),
    config = require('config'),
    Messages = require('../core/messages'),
    Deposits = require('../models/deposits'),
    RequestDataHandler = require('../handlers/request-data-handler'),
    PaymentTransaction = require('../models/payment-transactions'),
    ccAvenueHandler = require('../handlers/ccavenue-handler'),
    PaymentTransactionService = require('../services/payment-transaction');

var router = express.Router();

// Router Methods
router


    .get('/dashboard',function (req,res,next) {
        PaymentTransactionService.dashboardDetails(function (err,result) {

            if (err) {

                next(err, req, res, next);

            } else {

                //res.postReq();

                res.json({
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                });
            }
        });
    })


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

        //var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        //PaymentTransaction.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {
            PaymentTransaction.find({},function (err,result) {

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

    .get('/member/:id', function (req, res, next) {

        // var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

   //     PaymentTransaction.find({'memberId':req.params.id,'paymentDescription':'Credit note'}).lean().exec(function (err, result) {

        PaymentTransactionService.getMembertrans(req.params.id,1,function (err,result) {


            if (err) {

                next(err, req, res, next);

            } else {
               /* var response;
                var allPayments=[];
                var details={
                    createdAt:'',
                    invoiceNo:'',
                    paymentMode:'',
                    credit:''
                };
                if(result!=null)
                {

                    for(var i=0; i<result.length;i++)
                    {
                        var data = result[i];
                        //console.log(JSON.stringify(data));
                        //console.log(data.createdAt);
                        details.createdAt=moment(data._doc.createdAt).format('DD-MM-YYYY, h:mm:s a');
                        details.invoiceNo=data.invoiceNo;
                        details.paymentMode=data.paymentMode;
                        details.credit=data.credit;
                       //data._doc.createdAt=moment(data.createdAt).format('DD-MM-YYYY, h:mm:s a').toString();
                        //data.paytm = moment(data.createdAt).format('DD-MM-YYYY, h:mm:s a');
                        allPayments.push(details);
                    }

                    response={
                        error: false,
                        message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                        description: '',
                        data: allPayments
                    };
                }
                else
                    {
                        response= {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};
                }
*/
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

    .get('/card/:id', function (req, res, next) {

        // var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        //     PaymentTransaction.find({'memberId':req.params.id,'paymentDescription':'Credit note'}).lean().exec(function (err, result) {

        PaymentTransactionService.getMembertrans(req.params.id,2,function (err,result) {


            if (err) {

                next(err, req, res, next);

            } else {
                /* var response;
                 var allPayments=[];
                 var details={
                 createdAt:'',
                 invoiceNo:'',
                 paymentMode:'',
                 credit:''
                 };
                 if(result!=null)
                 {

                 for(var i=0; i<result.length;i++)
                 {
                 var data = result[i];
                 //console.log(JSON.stringify(data));
                 //console.log(data.createdAt);
                 details.createdAt=moment(data._doc.createdAt).format('DD-MM-YYYY, h:mm:s a');
                 details.invoiceNo=data.invoiceNo;
                 details.paymentMode=data.paymentMode;
                 details.credit=data.credit;
                 //data._doc.createdAt=moment(data.createdAt).format('DD-MM-YYYY, h:mm:s a').toString();
                 //data.paytm = moment(data.createdAt).format('DD-MM-YYYY, h:mm:s a');
                 allPayments.push(details);
                 }

                 response={
                 error: false,
                 message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                 description: '',
                 data: allPayments
                 };
                 }
                 else
                 {
                 response= {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};
                 }
                 */
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
/*

    .get('/asdf',function (req,res,next) {
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
*/

    .get('/dayclosure/info', function (req, res, next) {

        //var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        //PaymentTransaction.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {
        PaymentTransactionService.dayClosure(function (err,result) {

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

    .post('/daywisecollection',function (req,res,next) {
        PaymentTransactionService.daywiseCollection(req.body,function (err,result) {
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


    .post('/cashcollection',function (req,res,next) {
        PaymentTransactionService.getCashclosures(req.body,function (err,result) {
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

    .post('/ccavRequestHandler',function (req,res,next) {
/*        PaymentTransactionService.ccavanueRequest(req.body,function (err,result) {
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
        });*/
        ccAvenueHandler.encrypt(req.body, function (err, result) {
            if (err) {

                next(err, req, res, next);

            } else {
                res.makePayment();
               /* ccavenue.makePayment(res);
                res.json({
                    error: false,
                    message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                    description: '',
                    data: result
                });*/
            }
        });
    })

    .post('/deposit', function (req, res, next) {
        PaymentTransactionService.depositCash(req.body,function (err,result) {
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

    .post('/cashclosure', function (req, res, next) {
        PaymentTransactionService.createcashClosure(req.body,function (err,result) {
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

    .post('/depositinfo', function (req, res, next) {
        PaymentTransactionService.depositInfo(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .post('/totalcollection', function (req, res, next) {
        PaymentTransactionService.totalCollection(req.body,function (err,result) {
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
    .post('/totalregwise', function (req, res, next) {
        PaymentTransactionService.totalCashRegWise(req.body,function (err,result) {
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

;
module.exports=router;