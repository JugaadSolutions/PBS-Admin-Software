var express = require('express'),
    Features = require('../models/features-list'),
    FeaturesService = require('../services/features-service'),
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
        Features.find({},function (err, result) {
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
        FeaturesService.createFeature(req.body,function (err,result) {
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
