var mongoose   = require('mongoose');
var Schema = mongoose.Schema;
var mSchema = new Schema({
"name": String,
"status": Number, //1 aktiv, 2 belum verify, 0, inactive
"vercode": String, //code untuk verification account
"authtoken":String,
"authtokenexp":Number,
"email": String,
"password": String,
"createdbyclient": String,
"modifiedbyclient": String,
"createdon": Number,
"modifiedon": Number,
});
module.exports = mongoose.model('users', mSchema);
