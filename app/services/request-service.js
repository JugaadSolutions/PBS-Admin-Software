/**
 * Created by root on 9/1/17.
 */
var req = require('request'),
    User = require('../models/user');

exports.requestHandler = function (httpMethod, uri, ip, requestBody,callback) {

   // EventLoggersHandler.logger.info(Messages.SENDING_REQUEST_TO_SERVER_BRIDGE + "URI: " + uri);

    //requestBody = EncryptionService.encrypt(requestBody);
    //var req = requestBody;
    var burl = 'http://'+ip+':13075/api/';
    //console.log(burl);
    req(
        {
            method: httpMethod,
            baseUrl: burl,
            uri: uri,
            json: true,
            body:requestBody
        }
        , function (error, response, body) {

            if (error) {
                // EventLoggersHandler.logger.error(error);
                //return console.error('Error : Unable to reach server');
                return callback(error,null);
            }

            if (body) {
                if (body.description) {
                    console.log("Response from Bridge: " + body.description);
                }
                if(!body.error)
                {
                    return callback(null,body.data);
                }

            }

        }
    )

};
