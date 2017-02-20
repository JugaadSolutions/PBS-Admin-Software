
var crypto = require('crypto'),
    cryptoae = require('../../node_modules/crypto-js'),
    cryptoMD5 = require('crypto-js/md5'),
    config = require('config'),
    async = require('async'),
    qs = require('querystring');

// Application Level Dependencies
var

    Messages = require('../core/messages');

exports.encrypt = function (record, callback) {

    var response;
    var orderId;

    async.series([

            // Step 1: Method encrypt data
            function (callback) {

                var workingKey = config.get('ccAvenue.workingKey');

                var merchantId = config.get('ccAvenue.merchantId');
                var accessCode = config.get('ccAvenue.accessCode');
                var currency = config.get('ccAvenue.currency');
                orderId = 'PBS' + new Date().getTime();

                var encRequest = 'amount=' + record.amount + '&merchant_id=' + merchantId + '&order_id=' + orderId + '&currency=' + currency;

                var m = crypto.createHash('md5');
                m.update(workingKey);
                //var key = m.digest('binary');
                var key = 'abcdefghijklmn';
                var iv = 'abcdefghijklmn';
                //var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
                console.log('Key-'+key);
                console.log('iv-'+iv);
                var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
                console.log('cipher-'+cipher);
                //var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
                var encoded = cipher.update(encRequest,'utf8','hex');
                encoded += cipher.final('hex');


                console.log(encoded);

                response = {
                    encRequest: encoded,
                    accessCode: config.get('ccAvenue.accessCode')
                };

                return callback(null, response);
            }/*,

            // Step 2: Method to create member payment transaction
            function (callback) {

                var txnDetails = {
                    invoiceNo: orderId,
                    member: record.memberId,
                    amount: record.amount,
                    paymentStatus: MemberPaymentTransaction.PaymentStatus.IN_PROGRESS
                };

                MemberPaymentTransactionService.create(txnDetails, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    return callback(null, result);
                });

            }*/

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, response);

        }
    );
};

exports.decrypt = function (encText, callback) {

    var parsedString;

    async.series([

            // Step 1: Method decrypt data
            function (callback) {

                var workingKey = config.get('ccAvenue.workingKey');

                var m = crypto.createHash('md5');
                m.update(workingKey);
                var key = m.digest();
                var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
                var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
                var decoded = decipher.update(encText, 'hex', 'utf8');
                decoded += decipher.final('utf8');

                parsedString = qs.parse(decoded);
                console.log(parsedString);

                return callback(null, decoded);
            }/*,

            function (callback) {

                MemberPaymentTransactionService.updatePaymentTransaction(parsedString, function (err, result) {

                    if (err) {
                        return callback(err, null);
                    }

                    return callback(null, result);
                });

            }*/

        ],

        function (err, result) {

            if (err) {
                return callback(err, null);
            }

            return callback(null, result);

        }
    );
};
/*
var ccavenue = require('ccavenue'),
    config = require('config'),
    async = require('async');

exports.encrypt = function (record, callback) {

    var res;
    async.series([
        function (callback) {
            var url = 'http://www.mytrintrin.com/api/paymenttransaction/ccavresponsehandler';
            var workingKey = config.get('ccAvenue.workingKey');

            var merchantId = config.get('ccAvenue.merchantId');
            var accessCode = config.get('ccAvenue.accessCode');
            var currency = config.get('ccAvenue.currency');
            var orderId = 'PBS' + new Date().getTime();
            ccavenue.setMerchant(merchantId);
            ccavenue.setWorkingKey(workingKey);
            ccavenue.setOrderId(orderId);
            ccavenue.setRedirectUrl(url);
            ccavenue.setOrderAmount(record.amount);
           // res = ccavenue.makePayment(ccavenue);

            return callback(null,null);
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,ccavenue);
    });
};*/
