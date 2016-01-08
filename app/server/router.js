var USERSM = require('./modules/users-manager');
var DIS = require('./modules/diskusi-manager');
// var util = require('./modules/utils').utils;
// var Mailgun = require('mailgun-js');
var dbconn = require('./modules/db-connection');
var db = dbconn.db;
module.exports = function(app, socket) {
	// console.log("cekkk:"+util.tes1());
	var rememberme = function(res,id){
		res.cookie('im', id, { maxAge: 900000 });
	}
 	app.get('/*', function(req, res, next) {

		// if (req.headers.host.match(/^www/) == null ) res.redirect('http://www.' + req.headers.host + req.url, 301);
		// if (req.get('host').match(/^www/) == null ) console.log("BETULLLLLLLLLLLLLL");
		// else  console.log("SALAHHHHHHHHHHHHHHHHHH");
		// var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		
		 var re = /^www/;
		if(re.test(req.get('host'))){
			console.log("WWWWWWWWWWWWWWWWWWWWWWWWW");
			console.log("req.originalUrl "+req.originalUrl);
			console.log("req.protocol "+req.protocol);
			var oriUrl = req.originalUrl;
			var prot = req.protocol;
			var host = req.get('host');
			req.session.oriUrl = oriUrl;
			req.session.prot = prot;
			req.session.host = host;
			
			// res.redirect('http://' + req.headers.host + req.url, 301);
			// res.redirect('http://' + req.get('host').replace(/^www\./, '') + req.url);
			// res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
			// res.redirect(req.protocol+'://sekolahsabat.com'+req.originalUrl);
			res.redirect(''+req.session.prot+'://'+topdomain);
		}else{
			/* if(req.session.oriUrl != null){
					console.log("req.session.oriUrl is not nullllllll");
					var orU = req.session.oriUrl;
					var po = req.session.prot;
					var ho = req.session.host;
					req.session.oriUrl = null;
					req.session.prot = null;
					req.session.host = null;
					res.redirect(po+'://'+ho+orU);
			} */
			next();
		}
		/* var re = /^www/;
		 if (re.test(req.get('host'))) {
			// res.redirect(301, 'http://' + req.headers.host.replace(/^www\./, '') + req.url);
			res.redirect('http://sekolahsabat.com'+req.url);
		  } else {
			next();
		  } */
		// if (req.get('host').match(/^www/) == null ) res.redirect('http://www.' + req.get('host') + req.url, 301);
		// else next();
	}); 
	
	app.post('/SS/androidSyncNewerDiskusiURL', function(req, res){
		DIS.androidSyncNewerDiskusiURL(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.post('/SS/androidSubmitDataDiskusiMessageURL', function(req, res){
		DIS.androidSubmitDataDiskusiMessageURL(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.get('/hproxy_check_location', function(req, res) {
		res.send("oksip");
	});
	app.put('/google56820aea7adece87.html', function(req, res) {
		res.send("google-site-verification: google56820aea7adece87.html");
	});
	app.get('/google56820aea7adece87.html', function(req, res) {
		res.send("google-site-verification: google56820aea7adece87.html");
	});
	app.post('/androidUserLoginURL', function(req, res) {
		USERSM.androidUserLoginURL(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.post('/androidUserSignupURL',function(req,res){
		USERSM.androidUserSignupURL(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.post('/androidAccountVerifyURL',function(req,res){
		USERSM.androidAccountVerifyURL(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.post('/androidForgotPasswordURL',function(req,res){
		USERSM.androidForgotPasswordURL(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.post('/androidCreateNewPasswordURL',function(req,res){
		USERSM.androidCreateNewPasswordURL(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.get('/getVercode',function(req,res){
		USERSM.getVercode(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.get('/RmAccountByEmail',function(req,res){
		USERSM.RmAccountByEmail(req,function(jsonResp){
			res.json(jsonResp);
		});
	});
	app.get('*', function(req, res) {
		var page = "index";
		var title = "Home";
		var output = function(){
			res.render(page,{});
		}
		output();
	});
};
