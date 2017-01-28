var express = require('express'),
TransactionService = require('../services/transaction-service'),
    UserService = require('../services/user-service'),
Messages = require('../core/messages');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

router


/*.post('/', function (req, res, next) {
  TransactionService.createUser(req.body,function (err,result) {
    if(err)
    {
      next(err, req, res, next);
    }
    else
    {
      res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});
    }

  });
})*/

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

        UserService.forgotPassword(req.body.email, function (err) {

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


;

module.exports = router;
