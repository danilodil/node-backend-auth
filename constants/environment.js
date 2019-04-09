require('dotenv').config();

exports.ENV = process.env.NODE_ENV;
exports.PORT = process.env.PORT || '4000';
exports.UIURL = process.env.UIURL;
exports.APIURL = process.env.APIURL;
exports.DBNAME = process.env.DBNAME;
exports.DBHOST = process.env.DBHOST;
exports.DBPORT = process.env.DBPORT;
exports.DBUSERNAME = process.env.DBUSERNAME;
exports.DBPASSWORD = process.env.DBPASSWORD;
exports.DBURL = process.env.DATABASE_URL

exports.REDISHOST = process.env.REDISHOST;
exports.REDISPORT = process.env.REDISPORT;
exports.REDISPASSWORD = process.env.REDISPASSWORD;
exports.REDISDB = process.env.REDISDB;
exports.REDIS_URL = process.env.REDIS_URL;

