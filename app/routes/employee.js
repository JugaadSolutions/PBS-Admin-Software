var express = require('express'),
    RegStaff = require('../models/registration-staff'),
    RequestDataHandler = require('../handlers/request-data-handler'),
    EmployeeService = require('../services/employee-service'),
    User = require('../models/user'),
    GolbalStats = require('../models/global-settings'),
    LeaveTrack = require('../models/leave-tracker'),
    Messages = require('../core/messages');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });*/

router

    .get('/', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        User.find({'_type':{$ne:'member'}}).lean().exec(function (err, result) {
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
    .get('/departments', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        GolbalStats.findOne({name:'Employee'}   ,function (err, result) {
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
    .get('/:id', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        if(isNaN(req.params.id))
        {
            User.find({_id:req.params.id},function (err, result) {
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
        }
        else
        {
            User.find({UserID:req.params.id},function (err, result) {
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
        }

    })

    .get('/registrationstaff/emp', function (req, res, next) {

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

    .get('/moneregstaff/emp', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/

            EmployeeService.getBothMoneandRegstaff( function (err, result) {
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

    .get('/mcstaff/emp', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        User.find({'_type':'maintenancecentre-employee'}).lean().exec(function (err, result) {
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
    .get('/operator/emp', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        User.find({'_type':'Operator'}).lean().exec(function (err, result) {
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
    .get('/hastaff/emp', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        User.find({'_type':'Holdingarea-employee'}).lean().exec(function (err, result) {
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
    .get('/rvstaff/emp', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        User.find({'_type':'redistribution-employee'}).lean().exec(function (err, result) {
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
    .get('/monestaff/emp', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        User.find({'_type':'Mysoreone-employee'}).lean().exec(function (err, result) {
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

    .get('/leave/emp', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        LeaveTrack.find({}).deepPopulate('empid createdBy').lean().exec(function (err, result) {
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

    .get('/:id/leave', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        EmployeeService.getOneEmployeeLeaveInfo(req.params.id,function (err, result) {
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

    .get('/:id/cyclestatus', function (req, res, next) {

        /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

         Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        EmployeeService.getCyclesWithEmployee(req.params.id,function (err, result) {
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
        EmployeeService.createEmployee(req.body,1,function (err,result) {
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

    .post('/mcstaff', function (req, res, next) {
        EmployeeService.createEmployee(req.body,2,function (err,result) {
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

    .post('/rvstaff', function (req, res, next) {
        EmployeeService.createEmployee(req.body,3,function (err,result) {
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
    .post('/operator', function (req, res, next) {
        EmployeeService.createEmployee(req.body,4,function (err,result) {
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
    .post('/accountstaff', function (req, res, next) {
        EmployeeService.createEmployee(req.body,5,function (err,result) {
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
    .post('/monitorgrp', function (req, res, next) {
        EmployeeService.createEmployee(req.body,6,function (err,result) {
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

    .post('/hastaff', function (req, res, next) {
        EmployeeService.createEmployee(req.body,7,function (err,result) {
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
    .post('/monestaff', function (req, res, next) {
        EmployeeService.createEmployee(req.body,8,function (err,result) {
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

    .post('/kone/admin', function (req, res, next) {
        EmployeeService.createEmployee(req.body,9,function (err,result) {
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

    .post('/:id/assigncard', function (req, res, next) {

        EmployeeService.addCard(req.params.id, req.body.cardNumber, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .post('/leave', function (req, res, next) {

        EmployeeService.addLeaveDetails(req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

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
