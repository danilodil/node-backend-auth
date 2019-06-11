require('dotenv').config();

exports.ENV = process.env.ENV;
exports.PORT = process.env.PORT || '4000';
exports.DATABASE_URL = process.env.DATABASE_URL;

