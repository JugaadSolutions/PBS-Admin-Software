/**
 * Created by root on 16/1/17.
 */
// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var SettingService = require('../services/globalsetting-service'),
    Settings = require('../models/global-settings'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .get('/',function (req,res,next) {
        Settings.find({'visibility':1},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/globalinfo',function (req,res,next) {
        SettingService.globalInfo(function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/:id',function (req,res,next) {
        Settings.findOne({name:req.params.id,'visibility':1},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/app/msg',function (req,res,next) {
        Settings.findOne({name:"Message",'visibility':0},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message: Messages.FETCHING_RECORDS_SUCCESSFUL, description: '', data: result.value[0].text});
            }

        });
    })
    .post('/app/add/msg',function (req,res,next) {
        Settings.findOneAndUpdate({name:"Message",'visibility':0},{$set:{value:{"visibility" :0, "text" : req.body.msg}}},{new:true},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else {
                res.json({error: false, message:"Adding msg successful", description: '', data: result.value[0].text});
            }

        });
    })

    .post('/', function (req, res, next) {

        SettingService.createSetting(req.body,function (err,result){

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});

            }

        });

    })

    .put('/:id', function (req, res, next) {

        var existingRecord = req.body;

        SettingService.updateSetting(req.params.id,existingRecord, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.UPDATING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

    .delete('/:id', function (req, res, next) {

        Settings.findByIdAndRemove(req.params.id, function (err, result) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.DELETING_RECORD_SUCCESSFUL, description: '', data: result});

            }

        });

    })

;

module.exports = router;
