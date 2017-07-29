var express = require('express'),
    moment = require('moment'),
    Member = require('../models/member'),
    Constants = require('../core/constants'),
    RequestDataHandler = require('../handlers/request-data-handler'),
    MemberService = require('../services/member-service'),
    User = require('../models/user'),
    Messages = require('../core/messages');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });*/

router

    .get('/qweuird78fj3498asdjkfhahsysd98y4rsdjhf', function (req, res, next) {

       /* var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        Member.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {*/
        Member.find({'_type':'member'}).sort('-createdAt').deepPopulate('membershipId').lean().exec(function (err, result) {
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
        //string
        var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);
        if(isNaN(req.params.id))
        {

            Member.findOne({$or:[{_id:req.params.id},{phoneNumber:req.params.id}]}).populate(appliedFilter.options.populate).deepPopulate('membershipId').exec(function (err, result) {
                if (err) {

                    next(err, req, res, next);

                } else {
                    if(result)
                    {
                        //result["valid"]="yes";
                        result._doc["valid"]="yes";
                        if(result.status==0)
                        {

                        }
                        else {
                            var validity = moment(result.validity);
                            var current = moment();
                            var days = moment.duration(validity.diff(current));
                            var duration = days.asDays();
                            if (duration < 0) {
                                result._doc.valid = "no";
                            }
                        }
                    }

                    var response = result != null ? {
                        error: false,
                        message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                        description: '',
                        data: result
                    } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                    res.json(response);

                }

            });
        }
        else
        {
            Member.findOne({$or:[{UserID:req.params.id},{phoneNumber:req.params.id}]}).populate(appliedFilter.options.populate).deepPopulate('membershipId').exec(function (err, result) {
                if (err) {

                    next(err, req, res, next);

                } else {
                    if(result)
                    {
                        //result["valid"]="yes";
                        result._doc["valid"]="yes";
                        if(result.status==0)
                        {

                        }
                        else
                        {
                            var validity = moment(result.validity);
                            var current = moment();
                            var days = moment.duration(validity.diff(current));
                            var duration = days.asDays();
                            if(duration<0) {
                                result._doc.valid="no";
                            }
                        }

                    }
                    var response = result != null ? {
                        error: false,
                        message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                        description: '',
                        data: result
                    } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                    res.json(response);

                }

            });
        }
    })
    .get('/info/:id', function (req, res, next) {
        //string
        var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);
        User.findOne({token:req.headers.authorization,_type:"admin"},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            if(!result)
            {
                console.log(req.headers.authorization);
                Member.findOne({UserID:req.params.id,token:req.headers.authorization}).populate(appliedFilter.options.populate).exec(function (err, result) {
                    if (err) {

                        next(err, req, res, next);

                    } else {
                        if(result)
                        {
                            //result["valid"]="yes";
                            result._doc["valid"]="yes";
                            if(result.status==0)
                            {

                            }
                            else {
                                var validity = moment(result.validity);
                                var current = moment();
                                var days = moment.duration(validity.diff(current));
                                var duration = days.asDays();
                                if (duration < 0) {
                                    result._doc.valid = "no";
                                }
                            }
                        }
                        var response = result != null ? {
                            error: false,
                            message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                            description: '',
                            data: result
                        } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                        res.json(response);

                    }

                });
            }
            else
            {
                console.log(req.headers.authorization);
                Member.findOne({UserID:req.params.id}).populate(appliedFilter.options.populate).exec(function (err, result) {
                    if (err) {

                        next(err, req, res, next);

                    } else {
                        if(result)
                        {
                            //result["valid"]="yes";
                            result._doc["valid"]="yes";
                            if(result.status==0)
                            {

                            }
                            else {
                                var validity = moment(result.validity);
                                var current = moment();
                                var days = moment.duration(validity.diff(current));
                                var duration = days.asDays();
                                if (duration < 0) {
                                    result._doc.valid = "no";
                                }
                            }
                        }
                        var response = result != null ? {
                            error: false,
                            message: Messages.FETCHING_RECORDS_SUCCESSFUL,
                            description: '',
                            data: result
                        } : {error: false, message: Messages.NO_SUCH_RECORD_EXISTS_IN_THE_DATABASE, description: '', data: {}};

                        res.json(response);

                    }

                });
            }
        });
/*        if(isNaN(req.params.id))
        {

            Member.findOne({$or:[{_id:req.params.id},{phoneNumber:req.params.id}]},{token:req.headers.authorization}).populate(appliedFilter.options.populate).exec(function (err, result) {
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
        }
        else
        {

        }*/
    })

    .get('/:id/cancelmemberrequest', function (req, res, next) {

        MemberService.cancelMembershiprequest(req.params.id, function (err, result) {

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

    .get('/negative/balance',function (req, res, next) {

        Member.find({creditBalance:{$lt:0},status:{$ne:0}}).select('-_id cardNum creditBalance').lean().exec(function (err, result) {

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
        MemberService.createMember(req.body,function (err,result) {
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
    .post('/add', function (req, res, next) {
        MemberService.addMember(req.body,function (err,result) {
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
    .post('/requestotp', function (req, res, next) {
        MemberService.requestOTP(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
               /* var data = {
                    otpstatus:'success'
                };*/
                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});
            }

        });
    })
    .post('/verifyotp', function (req, res, next) {
        MemberService.verifyOTP(req.body,function (err,result) {
         if(err)
         {
            next(err, req, res, next);
         }
         else
         {
            res.json({error: false, message: Messages.OTP_VERIFY_SUCCESS, description: '', data: result});
         }
         });
    })
    .post('/search', function (req, res, next) {
        MemberService.searchMember(req.body,function (err,result) {
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

    .post('/:id/assignmembership', function (req, res, next) {

        MemberService.assignMembership(req.params.id, req.body.membershipId, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.UPDATING_RECORD_SUCCESSFUL,
                    description: '',
                    data: result
                });

            }

        });

    })

    .post('/:id/assigncard', function (req, res, next) {

        MemberService.addCard(req.params.id, req.body.cardNumber, req.body.membershipId,req.body.createdBy,function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .post('/:id/cancelmembership', function (req, res, next) {

        MemberService.cancelMembership(req.params.id,req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.UPDATING_RECORD_SUCCESSFUL,
                    description: '',
                    data: result
                });

            }

        });

    })

    .post('/:id/suspendmembership', function (req, res, next) {

        MemberService.suspendMembership(req.params.id,req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.UPDATING_RECORD_SUCCESSFUL,
                    description: '',
                    data: result
                });

            }

        });

    })

    .post('/:id/credit', function (req, res, next) {

        MemberService.creditMember(req.params.id, req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.YOUR_PAYMENT_HAS_BEEN_SUCCESSFULLY_PROCESSED,
                    description: '',
                    data: result
                });

            }

        });

    })

    .post('/:id/credit/paygov', function (req, res, next) {

        MemberService.creditMemberWithPayGov(req.params.id, req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.YOUR_PAYMENT_HAS_BEEN_SUCCESSFULLY_PROCESSED,
                    description: '',
                    data: result
                });

            }

        });

    })

    .post('/:id/topup', function (req, res, next) {

        MemberService.topupMember(req.params.id, req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({
                    error: false,
                    message: Messages.YOUR_PAYMENT_HAS_BEEN_SUCCESSFULLY_PROCESSED,
                    description: '',
                    data: result
                });

            }

        });

    })

    .post('/:id/debit', function (req, res, next) {

        MemberService.debitMember(req.params.id, req.body, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DEBIT_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        MemberService.updateMember(existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
    .put('/email/:id', function (req, res, next) {

        MemberService.updateMemberEmail(req.params.id,req.body,function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })
    .put('/:id/credit/correction', function (req, res, next) {

        Member.findOneAndUpdate({cardNum:req.params.id}, {$set:{creditBalance:req.body.credit}},{new:true}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            }
            if(result)
            {
                Member.findByIdAndUpdate(result._id,{$set:{lastModifiedAt:new Date()}},{new:true},function (err,mem) {
                    if(err)
                    {
                        next(err, req, res, next);
                    }
                    else
                    {
                        res.json({
                            error: false,
                            message: Messages.UPDATING_RECORD_SUCCESSFUL,
                            description: '',
                            data: mem
                        });
                    }

                });
            }
            else {

                res.json({
                    error: false,
                    message: "No member found for this ID",
                    description: '',
                    data: "No member found for this ID"
                });

            }

        });

    })

;
module.exports = router;
