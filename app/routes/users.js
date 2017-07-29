var express = require('express'),
TransactionService = require('../services/transaction-service'),
    Users = require('../models/user'),
    UserService = require('../services/user-service'),
Messages = require('../core/messages');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

router


    .get('/qweuird78fj3498asdjkfhahsysd98y4rsdjhf', function (req, res, next) {
        Users.find({_type:{$ne:'admin'}},function (err,result) {
        if(err)
        {
          next(err, req, res, next);
        }
        else
        {
          res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
        }

      });
    })

    .get('/ondemand/qweuird78fj3498asdjkfhahsysd98y4rsdjhf', function (req, res, next) {
        Users.find({_type:{$ne:'admin'},ondemand:true},function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.FETCH_RECORD_SUCCESSFUL, description: '', data: result});
            }

        });
    })

    .get('/count/detail', function (req, res, next) {
        UserService.detailedCount(function (err,result) {
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

    .post('/search', function (req, res, next) {
        UserService.searchUser(req.body,function (err,result) {
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

    .put('/change/ondemand', function (req, res, next) {

        UserService.changeOndemand(req.body, function (err,result) {

            if (err) {

                next(err);

            } else {

                res.json({
                    error: false,
                    message: Messages.RECORD_UPDATED_SUCCESSFUL,
                    description: null,
                    data: result
                });

            }

        });

    })

    .put('/:id/password/change', function (req, res, next) {

      UserService.changePassword(req.params.id, req.body, function (err) {

        if (err) {

          next(err);

        } else {

          res.json({
            error: false,
            message: Messages.RECORD_UPDATED_SUCCESSFUL,
            description: null,
            data: true
          });

        }

      });

    })

    .put('/forgotpassword', function (req, res, next) {

        UserService.forgotPassword(req.body, function (err) {

            if (err) {

                next(err);

            } else {

                res.json({
                    error: false,
                    message: Messages.RECORD_UPDATED_SUCCESSFUL,
                    description: null,
                    data: true
                });

            }

        });

    })

    .put('/resetpassword', function (req, res, next) {

        UserService.resetPassword(req.body, function (err) {

            if (err) {

                next(err);

            } else {

                res.json({
                    error: false,
                    message: Messages.YOUR_PASSWORD_HAS_BEEN_RESET_SUCCESSFULLY,
                    description: null,
                    data: true
                });

            }

        });

    })
    .put('/all/clear/vehicles', function (req, res, next) {

        UserService.clearAllVehicles(function (err,result) {

            if (err) {

                next(err);

            } else {

                res.json({
                    error: false,
                    message: "All cleared successfully",
                    description: null,
                    data: result
                });

            }

        });

    })
    .put('/ondemand', function (req, res, next) {

        UserService.updateOndemand(req.body,function (err,result) {

            if (err) {

                next(err);

            } else {

                res.json({
                    error: false,
                    message: Messages.UPDATING_RECORD_SUCCESSFUL,
                    description: null,
                    data: result
                });

            }

        });

    })


;

module.exports = router;
