/**
 * Created by kiranniranjan on 6/13/16.
 */

var config = require('config');

exports.sendMail = function (emailMessage, cb) {

    var mandrill = require('mandrill-api/mandrill');
    var mandrill_client = new mandrill.Mandrill(config.get('mandrill.apiKey'));

    var message = {
        "html": emailMessage.html,
        "subject": emailMessage.subject,
        "from_email": emailMessage.fromEmail,
        "from_name": emailMessage.fromName,
        "to": emailMessage.to,
        "headers": {
            "Reply-To": emailMessage.replyTo
        },
        "important": true
    };

    var async = false;
    var ip_pool = "Main Pool";
    var send_at = "";

    mandrill_client.messages.send({
        "message": message,
        "async": async,
        "ip_pool": ip_pool,
        "send_at": send_at
    }, function (result) {

        cb(result);

    });

};

exports.handleMail = function (emailMessage, cb) {

    var mailgun = require('mailgun-js')({apiKey: config.get('mailgun.apiKey'), domain: config.get('mailgun.domain')});

    var data = {
        "from": emailMessage.fromEmail,
        "to": emailMessage.to,
        "subject": emailMessage.subject,
        "html": emailMessage.html,
        "h:Reply-To": emailMessage.replyTo
    };

    mailgun.messages().send(data, function (error, body) {

        return cb(error, body);

    });

};

