var http = require('http'),
    fs = require('fs'),
    ccav = require('./ccavutil.js'),
    qs = require('querystring');

exports.postRes = function(request,response){
    var ccavEncResponse='',
	ccavResponse='',	
	workingKey = '5F8405032B54AF1400A79BB0B92D2ECC',	//Put in the 32-Bit Key provided by CCAvenue.
	ccavPOST = '';
	
        request.on('data', function (data) {
	    ccavEncResponse += data;
	    ccavPOST =  qs.parse(ccavEncResponse);
	    var encryption = ccavPOST.encResp;
	    ccavResponse = ccav.decrypt(encryption,workingKey);
        });

	request.on('end', function () {
	    var pData = '';
	    pData = '<table border=1 cellspacing=2 cellpadding=2><tr><td>'	
	    pData = pData + ccavResponse.replace(/=/gi,'</td><td>')
	    pData = pData.replace(/&/gi,'</td></tr><tr><td>')
	    pData = pData + '</td></tr></table>'
            htmlcode = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>'+ pData +'</center><br></body></html>';
            response.writeHeader(200, {"Content-Type": "text/html"});
	    response.write(htmlcode);
	    response.end();
	}); 	
};
