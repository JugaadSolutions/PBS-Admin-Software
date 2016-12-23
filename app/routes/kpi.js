/**
 * Created by root on 20/12/16.
 */
var express = require('express'),
    Messages = require('../core/messages'),
    kpidsservice = require('../services/kpi-dockstation-service');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });*/

router

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
;
module.exports = router;