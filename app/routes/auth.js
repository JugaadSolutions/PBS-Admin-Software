// Third Party Dependencies
var express = require('express');

// Application Level Dependencies
var UserService = require("../services/user-service");

var Messages = require("../core/messages");

var router = express.Router();

// Router Methods
router

    .post('/login', function (req, res, next) {

        UserService.loginUser(req.body, function (err, data) {

            if (err) {

                next(err, req, res, next);

            } else {

                res.json({error: false, message: Messages.LOGIN_SUCCESSFUL, description: null, data: data});

            }

        });

    })

;

module.exports = router;
