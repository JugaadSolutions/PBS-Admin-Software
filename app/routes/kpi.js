/**
 * Created by root on 20/12/16.
 */
var express = require('express'),
    Messages = require('../core/messages'),
    kpireportservice = require('../services/kpi-hourlyreport'),
    kpivehicleservice = require('../services/kpi-vehicle-service'),
    kioskService = require('../services/kiosk-service'),
    Webinfo = require('../models/websiteInfo'),
    kpidsservice = require('../services/kpi-dockstation-service');
var webinfoService = require('../services/webinfo-service');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });*/

router
    .get('/webinfo', function (req, res, next) {

        //var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        // Card.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {
        Webinfo.find({},function (err, result) {
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

    .post('/webinfo/details', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        webinfoService.getWebinfo(req.body,function (err, result) {
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
    .post('/webinfo', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        webinfoService.createWebinfo(req.body,function (err, result) {
            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.RECORD_CREATED_SUCCESS,
                    description: '',
                    data: result
                });

            }

        });

    })
    .post('/hourlyreport', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        kpireportservice.getReport(req.body,function (err, result) {
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

    .post('/usagestats', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        kpivehicleservice.getusageReport(req.body,function (err, result) {
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

    .post('/cardreport', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        kpireportservice.getcardReport(req.body,function (err, result) {
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

    .post('/kioskreport', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        kioskService.getkioskReport(req.body,function (err, result) {
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

    .post('/dockstation', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        kpidsservice.kpistatinfo(req.body,function (err, result) {
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

    .post('/stationcleaninfo', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        kpidsservice.kpicleaninfo(req.body,function (err, result) {
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

    .post('/ticketsinfo', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        kpidsservice.kpiTicketsinfo(req.body,function (err, result) {
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

;
module.exports = router;