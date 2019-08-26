require('dotenv').config();

exports.CONFIG = {
  nodeEnv: process.env.ENV,
  port: process.env.PORT || '4000',
  dbUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
};
