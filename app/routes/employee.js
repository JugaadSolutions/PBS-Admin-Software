var express = require('express'),
    RegStaff = require('../models/registration-staff'),
    RequestDataHandler = require('../handlers/request-data-handler'),
    EmployeeService = require('../services/employee-service'),
    Messages = require('../core/messages');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });*/

router

    .get('/registrationstaff', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        RegStaff.find({'_type':'registration-employee'},function (err, result) {
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

    .post('/registrationstaff', function (req, res, next) {
        EmployeeService.createEmployee(req.body,function (err,result) {
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

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        EmployeeService.updateEmployee(existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })


;
module.exports = router;
