/**
 * pbs-admin-core
 *
 * Created by vishwas on 08/May/2016 at 18:15
 */

exports.validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};