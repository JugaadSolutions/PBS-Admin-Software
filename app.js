var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var helmet = require('helmet');
var cors = require('cors');
var compression = require('compression');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');
var http = require('http'),
    fs = require('fs'),
    ccav = require('./app/handlers/ccavutil.js'),
    qs = require('querystring'),
    ccavReqHandler = require('./app/handlers/ccavRequestHandler.js'),
    ccavResHandler = require('./app/handlers/ccavResponseHandler.js');
/*var routes = require('./routes/index');
var users = require('./routes/users');*/

var ErrorHandler = require('./app/handlers/error-handler');

var app = express();

app.use(compression({}));
app.use(cors());
app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
    }
}));
app.disable('x-powered-by');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res, next) {
  res.render('index', {title: 'PBS Admin Core'});
});

/*app.use('/', routes);
app.use('/users', users);*/
require('./app/models');
require('./app/routes')(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}*/

// production error handler
// no stacktraces leaked to user
/*
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/
app.use(function (err, req, res, next) {
  ErrorHandler.processError(err, function (status, response) {
    res.status(status).json(response);
  });
});


module.exports = app;
