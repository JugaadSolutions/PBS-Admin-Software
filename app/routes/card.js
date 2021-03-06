// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var Card = require('../models/card'),

    CardService = require('../services/card-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/:id',function (req,res,next) {
        if(isNaN(req.params.id))
        {
            Card.findOne({'_id':req.params.id},function (err,result) {
                if(err)
                {
                    next(err, req, res, next);
                }
                else {
                    res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
                }

            });
        }
        else
        {
            Card.findOne({cardUid:req.params.id},function (err,result) {
                if(err)
                {
                    next(err, req, res, next);
                }
                else {
                    res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
                }

            });
        }
    })

    .get('/', function (req, res, next) {

        //var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

       // Card.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {
            Card.find({}).deepPopulate('assignedTo membershipId issuedBy').lean().exec(function (err, result) {
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

        CardService.createCard(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .post('/reassign', function (req, res, next) {

        CardService.reassignCard(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

/*        if(isNaN(req.params.id))
        {*/
            CardService.updateCard(req.params.id, existingRecord,function (err, result) {

                if (err) {

                    next(err, req, res, next);

                } else {

                    res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

                }

            });
/*        }
        else
        {
            Card.findOneAndUpdate({cardUid:req.params.id}, existingRecord, {new: true}, function (err, result) {

                if (err) {

                    next(err, req, res, next);

                } else {

                    res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

                }

            });
        }*/
    })


;

module.exports = router;
