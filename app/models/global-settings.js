/**
 * Created by root on 16/1/17.
 */
//require('./index');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var abstract = require('./abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    Messages = require('../core/messages'),
    moment = require('moment'),
    Constants = require('../core/constants');

var GlobalSettingSchema = mongoose.Schema({
    globalId:Number,
    name: {type: String, required: true, unique: true},
    value: {type: [], required: true},
    visibility:{type:Number,required:false,default:1}
}, { collection : 'global-settings' });


var Gs = mongoose.model('global-setting', GlobalSettingSchema);

GlobalSettingSchema.plugin(abstract);

GlobalSettingSchema.plugin(autoIncrement.plugin,{model:Gs,field:'globalId',startAt: 1, incrementBy: 1});

Gs.count({name:'Commissioned-Date'},function (err,count) {
    if(err)
    {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_USER_COLLECTION + err);
    }
    if(count<1)
    {
        var d = moment().format('YYYY-MM-DD');
        var data = {
            name:'Commissioned-Date',
            value:[d]
        };
        Gs.create(data,function (err) {
            if (err) {
                throw new Error('Global setting initialization error ' + err);
            }
        });
    }
});

Gs.count({name:'Employee'},function (err,count) {
    if(err)
    {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_USER_COLLECTION + err);
    }
    if(count<1)
    {
        var data = {
            name:'Employee',
            value:[],
            visibility:0
        };
        var allValues = [{
            department:'Registration',
            uri:'registrationstaff',
            role:'registration-employee',
            visibility:1
            },
            {
                department:'Maintenance',
                uri:'mcstaff',
                role:'maintenancecentre-employee',
                visibility:1
            },
            {
                department:'Redistribution',
                uri:'rvstaff',
                role:'redistribution-employee',
                visibility:0
            },
            {
                department:'Operator',
                uri:'operator',
                role:'Operator',
                visibility:0
            },
            {
                department:'Monitor-group',
                uri:'monitorgrp',
                role:'Monitor-group',
                visibility:0
            },
            {
                department:'Accounts',
                uri:'accountstaff',
                role:'Accounts-admin',
                visibility:1
            },
            {
                department:'Holding-area',
                uri:'hastaff',
                role:'Holdingarea-employee',
                visibility:0
            }

        ];
        data.value = allValues;
        Gs.create(data,function (err) {
            if (err) {
                throw new Error('Global setting initialization error ' + err);
            }
        });
    }
});

module.exports = Gs;