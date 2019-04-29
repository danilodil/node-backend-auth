const ENVIRONMENT = require('./environment');

exports.CONFIG = {
  nodeEnv: ENVIRONMENT.ENV,
  dbName: ENVIRONMENT.DBNAME,
  dbHost: ENVIRONMENT.DBHOST,
  dbPort: ENVIRONMENT.DBPORT,
  dbUserName: ENVIRONMENT.DBUSERNAME,
  dbPassword: ENVIRONMENT.DBPASSWORD,
};
