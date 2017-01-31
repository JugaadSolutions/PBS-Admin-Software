
// Third party dependencies
var config = require('config'),
    request = require('request'),
    swig = require("swig");

// Application Level dependency
var EmailHandler = require('../handlers/email-handler');

exports.sendMail = function (emailMessage) {

    const notificationEnabled = config.get("emailNotification.enabled");

    if (!notificationEnabled) {
        return;
    }

    const fromEmail = config.get("emailConfig.fromEmail");
    const fromName = config.get("emailConfig.fromName");
    const replyTo = config.get("emailConfig.replyTo");

    emailMessage.fromEmail = fromEmail;
    emailMessage.fromName = fromName;
    emailMessage.replyTo = replyTo;

    EmailHandler.handleMail(emailMessage, function (err, result) {

        if (err) {
            console.log(err);
        }

        if (result) {
            console.log("Email Sent" + result);
        }
    })


};

exports.renderHtmlTemplate = function (filePath, data) {
    return swig.renderFile(filePath, data);
};

exports.renderTextTemplate = function (text, data) {

    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    return text.format(data.profileName, data.email, data.randomPassword);

};

exports.renderSignUpTemplate = function (text, data) {

    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    return text.format(data.password);

};