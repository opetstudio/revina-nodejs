var fs = require('fs');
var crypto 		= require('crypto');
var dbconn = require('./db-connection');
var db = dbconn.db;
var util = require('./utils').utils;
var createdon_unix = new Date().getTime();
exports.db = db;
var users = db.collection('users');
var tb_diskusi = db.collection('tb_diskusi');
exports.androidSubmitDataDiskusiMessageURL = function(req,callback){
	var createdon = new Date().getTime();
	// var msisdn = req.param('msisdn');
		var maximal_reload_newer = req.param('maximal_reload_newer');
		maximal_reload_newer = parseInt(maximal_reload_newer);
		var count_curr_rec = req.param('count_curr_rec');
		count_curr_rec = parseInt(count_curr_rec);
		var newer_modifiedon = req.param('newer_modifiedon');
		newer_modifiedon = parseInt(newer_modifiedon);
		var myreffid;
		var allData = JSON.parse(req.param('data'));
		var dataArray = allData;
		var responseJson = function(error,error_msg,dataAkun){
			var response = {};
			if(error=="0"){
				response.status = 'OK';
				response.error_msg = error_msg;
				response.data = dataAkun;
			}
			else{
				response.status = 'NOK';
				response.error_msg = error_msg;
				response.data = {};
			}
			callback(response);
		}
		
		var arrRow = [];
		var obj = {};
		var isError = 0;
		var checkEndOfRecord = function(index,arr){
			if(index == arr.length - 1){
				//end of row
				responseJson(isError,"",arrRow);
			}
		}
		dataArray.forEach(function(v,k){
			var jsonRow = {};
			var createdon = new Date().getTime();
			var sqlite_id = parseInt(v._id);
			var newData = {};
			var _client = "jboss";
			try {
				if(v.client != null || v.client != 'undefined' || v.client != 'null'){
					if(v.client == 'nodejs'){
						// console.log('data come from jboss');
						createdon = v.createdon;
						sqlite_id = parseInt(v.sqlite_id);
						newData._id = util.getObjectId(v._id);
					}
					else{
						// console.log('data come from android');
					}
				}
				else{
					// console.log('data come from android');
				}
			}
			catch(err) {
				console.log('ada error. data come from android: ',err);
			}
			
			// console.log("submit ",dataArray[key]);
		// var obj = obj+""+dataArray[key];
		//create new
			newData.lesson_id = v.lesson_id;
			newData.lesson_id_inc = parseInt(v.lesson_id_inc);
			newData.type = parseInt(v.type);
			newData.status = 2;
			newData.tanggal = v.tanggal;
			newData.senderEmail = v.senderEmail;
			newData.senderName = v.senderName;
			newData.MsgSenderMsisdn = v.MsgSenderMsisdn;
			newData.message = v.message;
			newData.createdon = createdon;
			newData.createdonlocal = parseInt(v.createdonlocal);
			newData.modifiedon = createdon;
			newData.time = parseInt(v.createdon);
			newData.sqlite_id = sqlite_id;
			newData.client = _client;
			newData.client_from = v.client;
			tb_diskusi.findOne({senderName:newData.senderName,createdonlocal:newData.createdonlocal,message:newData.message}, function(e, o) {
				// console.log("findOne :"+newData.senderName+"|"+newData.createdonlocal+"|"+newData.message);
				if(!e && o){
					console.log("exist|"+v.client+"|"+newData.senderName+"|"+newData.createdonlocal+"|"+newData.message);
				}else{
					console.log("notexist|"+v.client+"|"+newData.senderName+"|"+newData.createdonlocal+"|"+newData.message);
					tb_diskusi.save(newData, {safe: true}, function(err,o2) {
						db.collection('tb_diskusi_copy').save(newData, {safe: true}, function(err3,o3) {
							// callback(isError,arrRow,o);
						});
						
						arrRow.push(newData);
						if (err) isError = 1;
						checkEndOfRecord(k,dataArray);
					});
				}
			});
		});
		// callback(isError,arrRow);
		
}
exports.androidSyncNewerDiskusiURL = function(req,callback){
	var email = req.param('email');
	var createdon = new Date().getTime();
	var maximal_reload_newer = req.param('maximal_reload_newer');
	maximal_reload_newer = parseInt(maximal_reload_newer);
	var count_curr_rec = req.param('count_curr_rec');
	count_curr_rec = parseInt(count_curr_rec);
	var newer_modifiedon = req.param('newer_modifiedon');
	newer_modifiedon = parseInt(newer_modifiedon);
	var current_lesson_id = req.param('current_lesson_id');
	var channel = "other";
	
	
	
	var newData = {};
	newData.authtoken = "";
	
	var unixtime = new Date().getTime();
	var email = req.param('email');
	var pass = req.param('pass');
	var client = req.param('client');
	var authtokenexp = unixtime + ((1000*60*60)*24); //24jam
	
	var jsonResp = function(e,o){
		if(!e) callback({maximal_reload_newer:maximal_reload_newer,newer_modifiedon:newer_modifiedon,alldata:o});
				else callback({alldata:[]});
		// callback({maximal_reload_newer:maximal_reload_newer,newer_modifiedon:newer_modifiedon,alldata:o});
	}
	
	var query = {};
	if(current_lesson_id != "undefined" && current_lesson_id != null && current_lesson_id != 'null' && current_lesson_id.length > 0){
		query.lesson_id = current_lesson_id;
	}
	else{
		if(count_curr_rec < maximal_reload_newer){
			// maximal_reload_newer = 400;
			// query = {};
		}
		else{
			// query = {modifiedon:{$gt: newer_modifiedon}};
			// query.modifiedon = {$gt: newer_modifiedon};
			
		}
		//TARU DISINI SUPAYA NDA TALALU BARAT BEBAN SERVER
		query.modifiedon = {$gt: newer_modifiedon};
	}
	// console.log(email+' androidSyncNewerDiskusiURL query = ',query);
	// console.log(email+' androidSyncNewerDiskusiURL maximal_reload_newer = ',maximal_reload_newer);
	var log_date = new Date();
	console.log('['+log_date+']'+' [androidSyncNewerDiskusiURL] '+email);
	// console.log('newer_modifiedon = ',newer_modifiedon);
	 
	tb_diskusi.find(query).sort({modifiedon:-1}).limit(maximal_reload_newer).toArray(function(e, o) {
	// tb_diskusi.find(query).sort({modifiedon:-1}).toArray(function(e, o) {
		// console.log('o = ',o);
	// db_diskusi.find().sort({modifiedon:-1}).toArray(function(e, o) {
		// console.log('errorrrrr',e);
			if(e) jsonResp(e,o);
			else{
				// var allRow = [];
				// o.forEach(function(d) {
					// allRow.push({
						
					// });
				// });
				jsonResp(null,o);
			}
		});
	
}
