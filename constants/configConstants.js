const ENVIRONMENT = require('./environment');

exports.CONFIG = {
  nodeEnv: ENVIRONMENT.ENV,
  uiUrl: ENVIRONMENT.UIURL,
  apiUrl: ENVIRONMENT.APIURL,
  dbName: ENVIRONMENT.DBNAME,
  dbHost: ENVIRONMENT.DBHOST,
  dbPort: ENVIRONMENT.DBPORT,
  dbUserName: ENVIRONMENT.DBUSERNAME,
  dbPassword: ENVIRONMENT.DBPASSWORD,
};

exports.REDIS = {
  host: ENVIRONMENT.RADISHOST,
  port: ENVIRONMENT.RADISPORT,
  pass: ENVIRONMENT.RADISPASSWORD,
  db: ENVIRONMENT.RADISDB,
};