require('dotenv').config();

exports.ENV = process.env.ENV;
exports.PORT = process.env.PORT || '4000';
exports.DBNAME = process.env.DBNAME;
exports.DBHOST = process.env.DBHOST;
exports.DBPORT = process.env.DBPORT;
exports.DBUSERNAME = process.env.DBUSERNAME;
exports.DBPASSWORD = process.env.DBPASSWORD;
