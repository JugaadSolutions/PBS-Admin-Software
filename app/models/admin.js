require('./user');
var mongoose = require('mongoose'),
    crypto = require('crypto'),
    extend = require('mongoose-schema-extend'),

    Messages = require('../core/messages');


var AdminSchema = mongoose.model('user').schema.extend({

admin:String
});

var Admin = mongoose.model('admin',AdminSchema);

Admin.count({email: "admin@mytrintrin.com"}, function (err, count) {

    if (err) {
        throw new Error(Messages.COULD_NOT_SANITIZE_THE_USER_COLLECTION + err);
    }

    if (count < 1) {
        var passw = "MttAdmin@123";
        var hash = crypto.createHash('md5').update(passw).digest('hex');
        var defaults = {
            // profileName: "My Trin Trin Admin",
            //username: "admin@mytrintrin.com",
            email: "admin@mytrintrin.com",
            password: hash,
            Name:"Mahesha",
            lastName:"siddegowda",
            //smartCardNumber:"2DR35A6B00000000",
            emailVerified: "true",
            //role: "admin",
            phoneNumber:"91-80508-09988",
            sex:"Male",
            status:1
        };

        Admin.create(defaults, function (err) {

            if (err) {
                throw new Error(Messages.COULD_NOT_INITIALIZE_THE_USER_COLLECTION + err);
            }

        });

    }

});

module.exports=Admin;
