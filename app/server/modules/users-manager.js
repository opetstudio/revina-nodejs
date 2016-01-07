var fs = require('fs');
var crypto 		= require('crypto');
var dbconn = require('./db-connection');
var db = dbconn.db;
var createdon_unix = new Date().getTime();
exports.db = db;
var users = db.collection('users');
exports.androidUserLoginURL = function(req,callback){
	var newData = {};
	newData.authtoken = "";
	
	var unixtime = new Date().getTime();
	var email = req.param('email');
	var pass = req.param('pass');
	var client = req.param('client');
	var authtokenexp = unixtime + ((1000*60*60)*24); //24jam
	
	var jsonResp = function(code){
		callback({err_code:code,err_msg:dbconn.err[code].msg,notif:dbconn.err[code].notif,authtoken:newData.authtoken});
	}
	var do_login = function(query,o){
		validatePassword(pass, o.password, function(err, isMatch) {
			if(isMatch){
			saltAndHash(unixtime, function(authtoken){
				newData.authtoken = authtoken;
				newData.authtokenexp = authtokenexp;
				newData.modifiedon = unixtime;
				newData.modifiedbyclient = client;
				dbconn.users_model.update(query,newData,{ multi: false }, function(err2,newDoc){
					 if (err2) jsonResp('001');
					 else jsonResp('000');
				});
			});
			}else{
				jsonResp('005');
			}
		});
	}
	saltAndHash(pass, function(hash){
		var query = {email:email,status:1};
		dbconn.users_model.find(query,function (err, doc) {
			if(err) jsonResp('001');
			else if(doc.length == 0) jsonResp('005');
			else if(doc.length > 0) do_login(query,doc[0]);
			else jsonResp('001');
		});
	});
	
}
exports.androidUserSignupURL = function(req,callback){
	var createdon = new Date().getTime();
	var name = req.param('name');
	var email = req.param('email');
	var pass = req.param('pass');
	var client = req.param('client');
	console.log('request data[name='+name+'|email='+email+'|pass='+pass+'|client='+client+']');
	var newData = {};
	newData.name = name;
	newData.email = email;
	newData.status = 2;
	newData.password = pass;
	newData.modifiedbyclient = client;
	newData.vercode = req.param('vercode');
	newData.authtoken = "";
	newData.authtokenexp = 0;
	// newData.createdbyclient = client;
	// newData.createdon = createdon;
	newData.modifiedon = createdon;
	
	
	
	// {err_code:"000",err_msg:"success",notif:"berhasil signup"}
	var resJson = {};
	resJson.err_code = "000";
	resJson.err_msg = "success";
	resJson.notif = "berhasil signup";
	
	var out = function(){
		callback(resJson);
	}
	var out_001 = function(err){
		resJson.err_code = '001';
		resJson.err_msg = dbconn.err[resJson.err_code].msg;
		resJson.notif = dbconn.err[resJson.err_code].notif;
		console.log(err);
		console.log(resJson.notif);
		callback(resJson);
	}
	var out_002 = function(){
		resJson.err_code = "002";
		resJson.err_msg = dbconn.err[resJson.err_code].msg;
		resJson.notif =  dbconn.err[resJson.err_code].notif;
		console.log(resJson.notif);
		callback(resJson);
	}
	dbconn.users_model.find({ email:email},function (err, doc) {
		if (err){
			out_001(err);
		}
		else{
			if(doc.length > 0){
				//data exist
				//cek if aciv
				if(doc[0].status == 1){
					//akun sudah aktif
					out_002();
				}
				else{
					//update status menjadi 2 (inverify)
					saltAndHash(newData.password, function(hash){
						newData.password = hash;
						newData.modifiedon = new Date().getTime();
						newData.modifiedbyclient = client;
						var update = newData;
						var query = { email: email};
						var options = { multi: true };
						dbconn.users_model.update(query, update, options, function(err2,newDoc){
							 if (err2){
								out_001(err2);
							 }
							 else{
								 console.log('User updated: ',newDoc);
								 out();
							}
						});
					}); 
				}
			}
			else{
				// out();
				saltAndHash(newData.password, function(hash){
					newData.password = hash;
						newData.createdbyclient = client;
						newData.createdon = createdon;
					
					// create a new user
					var newUser = dbconn.users_model(newData);
					newUser.save(function(err2,newDoc){
						 if (err2){
							out_001(err2);
						 }
						 else{
							 console.log('User created: ',newDoc);
							 out();
						}
					});
				}); 
			}			
		}
	}); 
	
}
exports.androidAccountVerifyURL = function(req,callback){
	var createdon = new Date().getTime();
	var vercode = req.param('vercode');
	var email = req.param('email');
	var query = {email:email,vercode:vercode,status:2};
	var query1 = {email:email};
	
	console.log('[androidAccountVerifyURL]'+'query='+JSON.stringify(query));
	// console.log('tes:'+JSON.stringify(j));
	
	var options = { multi: true };
	var jsonResp = function(code){
		callback({err_code:code,err_msg:dbconn.err[code].msg,notif:dbconn.err[code].notif});
	}
	var do_activate = function(){
		dbconn.users_model.update(query,{status:1},{ multi: false }, function(err2,newDoc){
			 if (err2) jsonResp('001');
			 else jsonResp('000');
		});
	}
	dbconn.users_model.find(query1,function (err, doc){
		if(err) jsonResp('001');
		else if(doc.length == 0) jsonResp('004');
		else if(doc[0].status == 1) jsonResp('002'); //akun telah aktif
		else if(doc[0].status != 2) jsonResp('004'); //akun ada tapi inactive
		else if(doc[0].status == 2 && (doc[0].vercode != vercode)) jsonResp('003');
		else if(doc[0].status == 2 && (doc[0].vercode == vercode)) do_activate();
		else jsonResp('001');
	});
}
exports.androidForgotPasswordURL = function(req,callback){
	var createdon = new Date().getTime();
	var vercode = req.param('vercode');
	var email = req.param('email');
	// var query = {email:email,vercode:vercode,status:2};
	var query1 = {email:email,status:1};
	var options = { multi: true };
	var jsonResp = function(code){
		callback({err_code:code,err_msg:dbconn.err[code].msg,notif:dbconn.err[code].notif});
	}
	var do_update_vercode = function(){
		dbconn.users_model.update(query1,{vercode:vercode},{ multi: false }, function(err2,newDoc){
			 if (err2) jsonResp('001');
			 else jsonResp('000');
		});
	}
	dbconn.users_model.find(query1,function (err, doc){
		if(err) jsonResp('001');
		else if(doc.length == 0) jsonResp('004'); //Data not found
		else do_update_vercode();
	});
}
exports.androidCreateNewPasswordURL = function(req,callback){
	var newData = {};
	var vercode = req.param('vercode');
	var email = req.param('email');
	newData.password = req.param('pass');
	newData.modifiedbyclient = req.param('client');
	newData.modifiedon = new Date().getTime();
	newData.vercode = newData.modifiedon;
	
	// var confPass = req.param('confPass');
	var query = {email:email,vercode:vercode,status:1};
	var query1 = {email:email,status:1};
	
	
	
	var options = { multi: true };
	var jsonResp = function(code){
		callback({err_code:code,err_msg:dbconn.err[code].msg,notif:dbconn.err[code].notif});
	}
	var do_update_change_password = function(){
		saltAndHash(newData.password, function(hash){
			newData.password = hash;
			dbconn.users_model.update(query,newData,{ multi: false }, function(err2,newDoc){
				 if (err2) jsonResp('001');
				 else jsonResp('000');
			});
		});
	}
	dbconn.users_model.find(query1,function (err, doc){
		if(err) jsonResp('001');
		else if(doc.length == 0) jsonResp('004'); //Data not found
		else if(doc.length == 1 && doc[0].vercode != vercode) jsonResp('003'); //Data not found
		else do_update_change_password();
	});
}
exports.RmAccountByEmail = function(req,callback){
	var query1 = {email:req.param('email')};
	dbconn.users_model.findOneAndRemove(query1, function(err) {
	  // if (err) throw err;
	  if (err) throw err;
	  // we have deleted the user
	  callback({msg:'User deleted!'});
	});
}
exports.getVercode = function(req,callback){
	var query1 = {email:req.param('email')};
	dbconn.users_model.find(query1,function (err, doc){
		if(err) callback({'err':err});
		else if(doc.length > 0) callback({vercode:doc[0].vercode});
		else callback({vercode:""});
	});
}
/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}
exports.tes = function(){
	console.log("cobaaaaaaaaaaaaa");
};

var oc = function(a){
	var o = {};
	for(var i=0;i<a.length;i++) {
	o[a[i]]='';
	}
	return o;
}

var strip_tags = function(input, allowed) {
  //  discuss at: http://phpjs.org/functions/strip_tags/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Luke Godfrey
  // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //    input by: Pul
  //    input by: Alex
  //    input by: Marc Palau
  //    input by: Brett Zamir (http://brett-zamir.me)
  //    input by: Bobby Drake
  //    input by: Evertjan Garretsen
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Eric Nagel
  // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Tomasz Wesolowski
  //  revised by: Rafal Kukawski (http://blog.kukawski.pl/)
  //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
  //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
  //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
  //   returns 2: '<p>Kevin van Zonneveld</p>'
  //   example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
  //   returns 3: "<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>"
  //   example 4: strip_tags('1 < 5 5 > 1');
  //   returns 4: '1 < 5 5 > 1'
  //   example 5: strip_tags('1 <br/> 1');
  //   returns 5: '1  1'
  //   example 6: strip_tags('1 <br/> 1', '<br>');
  //   returns 6: '1 <br/> 1'
  //   example 7: strip_tags('1 <br/> 1', '<br><br/>');
  //   returns 7: '1 <br/> 1'

  allowed = (((allowed || '') + '')
    .toLowerCase()
    .match(/<[a-z][a-z0-9]*>/g) || [])
    .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '')
    .replace(tags, function($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

