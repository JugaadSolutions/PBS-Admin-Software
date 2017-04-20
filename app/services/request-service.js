/**
 * Created by root on 9/1/17.
 */
var req = require('request'),
     config = require('config'),
    User = require('../models/user');

exports.requestHandler = function (httpMethod, uri, ip, requestBody,callback) {

   // EventLoggersHandler.logger.info(Messages.SENDING_REQUEST_TO_SERVER_BRIDGE + "URI: " + uri);

    //requestBody = EncryptionService.encrypt(requestBody);
    //var req = requestBody;
    var burl = 'http://'+ip+':13080/api/';
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

exports.sdcRequestHandler = function (httpMethod, uri, requestBody,callback) {
    //requestBody = EncryptionService.encrypt(requestBody);
    req(
        {
            method: httpMethod,
            baseUrl: config.get('SDC.baseUrl'),
            uri: uri,
            json: true,
            body:requestBody
        }
        , function (error, response, body) {

            if (error) {
                // EventLoggersHandler.logger.error(error);
                return console.error('Error : Unable to reach server');
            }

            if (body) {
                if (body.description) {
                   console.error("Response from SDC API: " + body.description);
                }
                return callback(null,body.data);
            }

        }
    )

};
