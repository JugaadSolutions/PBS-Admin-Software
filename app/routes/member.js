var express = require('express'),
    Member = require('../models/member'),
    RequestDataHandler = require('../handlers/request-data-handler'),
    MemberService = require('../services/member-service'),
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
        Member.find({'_type':'member'},function (err, result) {
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

        var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        Member.findById(req.params.id).populate(appliedFilter.options.populate).exec(function (err, result) {

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
;

module.exports = router;
