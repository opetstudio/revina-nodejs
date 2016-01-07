var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var mongoose   = require('mongoose');
var assert = require('assert');
var isDev = process.env.OPENSHIFT_MONGODB_DB_URL ? false:true;
if (!isDev) {
	var dbPort 		= process.env.OPENSHIFT_MONGODB_DB_PORT;
	var dbHost 		= process.env.OPENSHIFT_MONGODB_DB_HOST;
	var dbName 		= process.env.OPENSHIFT_APP_NAME;
	var dbUserName 		= process.env.OPENSHIFT_MONGODB_DB_USERNAME;
	var dbPassword 		= process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
	var dbUrl = process.env.OPENSHIFT_MONGODB_DB_URL;
}
else{
	var dbPort 		= 27017;
	var dbHost 		= 'localhost';
	var dbName 		= 'okehsip';
	// var dbName 		= 'solusidijam7';
	var dbUserName = "";
	var dbPassword = "";
	var dbUrl = "127.0.0.1:27017/";
}

console.log("dbPort: "+dbPort);
console.log("dbHost: "+dbHost);
console.log("dbName: "+dbName);
console.log("dbUserName: "+dbUserName);
console.log("dbPassword: "+dbPassword);

var url = dbUrl + dbName;
// Connect to mongodb
var connect = function () {
    mongoose.connect(url);
};
connect();

/* establish the database connection */
// var db = monk('localhost:27017/nodetest1');
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
  // Establish connection to db
  db.open(function(err, db) {
	if(err) console.log("error waktu konek db "+err);
	else console.log("tidak ada error waktu konek db");
    // assert.equal(null, err);

    // Add a user to the database
    // db.addUser('user2', 'name', function(err, result) {
      // assert.equal(null, err);

      // Authenticate //kalo di local ini di remark
	  if(!isDev){
		  db.authenticate(dbUserName, dbPassword, function(err, result) {
			if(err) console.log(err);
			else console.log('success connected to database :: ' + dbName);
		  });
	  }
    // });
  });

exports.db = db;
var db_mongoose = mongoose.connection;
exports.db_mongoose = db_mongoose;
db_mongoose.on('error', console.error.bind(console, 'connection error:'));
db_mongoose.once('open', function (callback) {
  // yay!
  console.log('mongoose success connect');
});

var datadir = process.env.OPENSHIFT_DATA_DIR;
if (typeof process.env.OPENSHIFT_DATA_DIR === "undefined") {
	datadir = './../assets/images/';
}else{
	datadir = process.env.OPENSHIFT_DATA_DIR;
   // datadir = datadir+'assets/images';
}

exports.datadir = datadir;
exports.users_model = require('./models/users');
var err = [];
err['000'] = {msg:'Success',notif:'Transaksi berhasil diproses.'};
err['001'] = {msg:'Internal error',notif:'Maaf, terjadi kesalahan teknis. Cobalah beberapa saat lagi. Terim kasih.'};
err['002'] = {msg:'Account has active',notif:'Maaf, akun telah terpakai. Cobalah dengan email yg lain. Terima kasih.'};
err['003'] = {msg:'Invalid Verrification Code',notif:'Maaf, kode verifikasi salah.'};
err['004'] = {msg:'Data not found',notif:'Maaf, akun yang anda maksud, tidak ditemukan.'};
err['005'] = {msg:'Invalid user or password',notif:'Gagal login, akun tidak ditemukan.'};
exports.err = err;