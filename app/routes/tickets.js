/**
 * Created by root on 24/12/16.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var Ticket = require('../models/tickets'),
    TicketService = require('../services/ticket-service'),

    //RequestDataHandler = require('../handlers/request-data-handler'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/:id',function (req,res,next) {
        Ticket.find({'_id':req.params.id}).deepPopulate('user assignedEmp createdBy transactions.replierId').lean().exec(function (err, result) {
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

        //var appliedFilter = RequestDataHandler.createQuery(req.query['filter']);

        // Card.paginate(appliedFilter.query, appliedFilter.options, function (err, result) {
        Ticket.find({}).deepPopulate('user assignedEmp createdBy transactions.replierId').lean().exec(function (err, result) {
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

        TicketService.createTicket(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .post('/:id/addreply', function (req, res, next) {

        TicketService.addReply(req.params.id,req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        TicketService.ticketUpdate(req.params.id, existingRecord, {new: true}, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

;
module.exports = router;

