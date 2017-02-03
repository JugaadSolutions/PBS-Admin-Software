var http = require('http'),
    fs = require('fs'),
    _ = require('underscore'),
    ccav = require('./ccavutil.js'),
    request = require('request'),
    qs = require('querystring');

exports.postReq = function(formObject,response){
/*    var body = '',
	workingKey = '5F8405032B54AF1400A79BB0B92D2ECC',	//Put in the 32-Bit Key provided by CCAvenue.
	accessCode = 'AVUM66DI93AY80MUYA',			//Put in the Access Code provided by CCAvenue.
	encRequest = '',
	formbody = '';
				
    request.on('data', function (data) {
	body += data;
	encRequest = ccav.encrypt(body,workingKey); 
	formbody = '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';
    });
				
    request.on('end', function () {
        response.writeHeader(200, {"Content-Type": "text/html"});
	response.write(formbody);
	response.end();
    });
   return;*/

    var workingKey = "5F8405032B54AF1400A79BB0B92D2ECC";
    var accessCode = "AVUM66DI93AY80MUYA";
// formObject is data send from client
    var contentArray = [];
    _.each(formObject, function(value, key, data){
        contentArray.push(key+"="+data[key]);
    });
    var body = contentArray.join("&");
    var encRequest = ccav.encrypt(body,workingKey);
    var formBody = '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"  ><input type="text" name="access_code" id="access_code" value="'+ accessCode +'" style="display:none;" ><input type="text" id="encRequest" name="encRequest" value="'+ encRequest +'" style="display:none;" ><script language="javascript">document.redirect.submit();</script></form>';
    return response(formBody);
};
