require('dotenv').config();

exports.CONFIG = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || '4000',
  dbUrl: process.env.NODE_ENV === 'local'
    ? process.env.DATABASE_URL_LOCAL
    : process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  authSecret: process.env.XILO_AUTH_SECRET
};
