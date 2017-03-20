/**
 * Created by root on 15/3/17.
 */
var req = require('request'),
    config = require('config');

exports.requestHandler = function (requestBody,callback) {

    req.post(
        {
            headers: {'content-type' : 'application/json',
                        'key':'05d62908-fd4f-4222-8472-896cc85b16f0'},
            url: config.get('OTPURL'),
            json: true,
            body:requestBody
        }
        , function (error, response, body) {

            if (error) {
                return callback(error,null);
            }

            if (body) {
                    return callback(null,body);
            }
        }
    )

};
