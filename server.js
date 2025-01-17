/* ***************** /
Meraki Dashoard API Express Server

Supports redirects with custom request-meraki function.

/ ****************** */


// Environment  Variables

// External Configuration File
var configs = require('./configs.js');

/* Local Configuration alternative
var configs = {
    apiKey: 'YourAPIKey',
    apiUrl: 'https://api.meraki.com/api/v1' Updated Meraki API from V0 to V1
};
*/


/* ****************** */

var express = require('express');
//var request = require('request'); // Does not properly handle Meraki redirects
var requestMeraki = require('./request-meraki');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');


var index = require('./routes/index');
var login = require('./routes/login');
var terms = require('./routes/terms');

var app = module.exports = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Home page, default route
//app.use('/', cors(corsOptions), express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', index);
app.use('/login',login);
app.use('/terms',terms);

var corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}

// Development Tools

var morgan = require('morgan');
app.use(morgan('dev'))

var globalLog = require('global-request-logger');
globalLog.initialize();

globalLog.on('success', function(request, response) {
  console.log('SUCCESS');
  console.log('Request', request);
  console.log('Response', response);
});
 
globalLog.on('error', function(request, response) {
  console.log('ERROR');
  console.log('Request', request);
  console.log('Response', response);
});



var jsonParser = bodyParser.json();

// API Route - Will be proxied through Meraki Dashboard API
app.use('/api', jsonParser, function (req, res){
  console.log('API request url', req.url);
  console.log('API request headers', req.headers);
  console.log('request body, ', req.body);
  
  // Use client supplied API key or default to server config.
  var apiKey = '';
  if('x-cisco-meraki-api-key' in req.headers){
    apiKey = req.headers['x-cisco-meraki-api-key'];
    console.log("New headers sent", apiKey );
  }else{
    apiKey = configs.apiKey; 
  }
 
  var options = {
    qs: req.query,
    url: configs.apiUrl + req.url,
    method: req.method,
    body: JSON.stringify(req.body), 
    //followAllRedirects: true, // Does not work as intended with PUT,POST,DELETE (returns a [GET] on final location)
    headers: {
        'X-Cisco-Meraki-API-Key': apiKey,
        'Content-Type': 'application/json'
    } 
  }

  requestMeraki(options, function(err, response, data){
    if(err){
        console.log("requestMeraki err ", err)
        res.status(response.statusCode).send({
            message: 'err'
         });
        res.send(err);
    }
    console.log('FINAL res.statusCode ',response.statusCode);
    console.log('FINAL res.body ',response.body);

    res.setHeader('content-type', response.headers['content-type']);
    res.status(response.statusCode).send(data);
    
    
  });

});


// Start server
var port = process.env.PORT || 3000;
var server = app.listen(port, () => {
  console.log('WWW Server: http://'+ server.address().address+port+'/');
  console.log('Meraki API Client Proxy: http://'+server.address().address+ ':' +port+'/api');
  console.log('Meraki API Endpoint: ', configs.apiUrl);
});

