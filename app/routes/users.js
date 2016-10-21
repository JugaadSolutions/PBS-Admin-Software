var express = require('express'),
TransactionService = require('../services/transaction-service'),
Messages = require('../core/messages');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

router


.post('/', function (req, res, next) {
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
})
;

module.exports = router;
