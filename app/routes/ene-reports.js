/**
 * Created by root on 3/4/17.
 */
var express = require('express'),
    Messages = require('../core/messages'),
    eReports = require('../models/electronics-reports'),
    ElectronicsReportService = require('../services/electronics-report-service');

var router = express.Router();

// Router Methods
router
    .get('/:id',function (req,res,next) {

        eReports.findOne({electronicsinfoUid:req.params.id},function (err,result) {
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
        eReports.find({},function (err,result) {
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

        ElectronicsReportService.createElectronicsReport(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })
    .post('/bydate', function (req, res, next) {

        ElectronicsReportService.geteneReport(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});

            }

        });

    })
;
module.exports = router;