#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
// Create "express" app and http server.
var app  = express();
var fs      = require('fs');

server = require('http').createServer(app);
socket = require("socket.io").listen(server);
socket.enable('browser client minification');  // send minified client
socket.enable('browser client etag');          // apply etag caching logic based on version number
socket.enable('browser client gzip');          // gzip the file
socket.set('log level', 3);                    // reduce logging
// enable all transports (optional if you want flashsocket support, please note that some hosting
// providers do not allow you to create servers that listen on a port different than 80 or their
// default port)
socket.set('transports', [
    'websocket'
  , 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);
//  Get the environment variables we need.
var ipaddr  = process.env.OPENSHIFT_NODEJS_IP ||
              process.env.OPENSHIFT_INTERNAL_IP;
var port    = process.env.OPENSHIFT_NODEJS_PORT   ||
              process.env.OPENSHIFT_INTERNAL_PORT || 8080; 
if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_*_IP environment variable');
}

app.configure(function(){
	app.set('isDev', process.env.OPENSHIFT_NODEJS_PORT ? false:true);
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8000);
	app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
	//	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(require('connect-multiparty')());
	app.use(express.urlencoded());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret'}));
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
	app.use(express.static(__dirname + '/app/public'));
	app.engine('html', require('ejs').renderFile);
});

var routes = require('./app/server/router');
routes(app, socket);

function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}
//  Process on exit and signals.
process.on('exit', function() { terminator(); });
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

server.listen(app.get('port'), app.get('ipaddr'), function(){
console.log('Express server listening on IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
});

var sockets = [];
var users = {};
var users_channel = {};

socket.sockets.on('connection', function (client) {
});

