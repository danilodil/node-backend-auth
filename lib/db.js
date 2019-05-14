const debug = require('debug')('xilo-auth:db');
const Sequelize = require('sequelize');
const CONFIG_CONSTANTS = require('../constants/configConstants').CONFIG;

// ORM connection settings
const sequelize = new Sequelize(
  CONFIG_CONSTANTS.dbName,
  CONFIG_CONSTANTS.dbUserName,
  CONFIG_CONSTANTS.dbPassword,
  {
    username: CONFIG_CONSTANTS.dbUserName,
    password: CONFIG_CONSTANTS.dbPassword,
    database: CONFIG_CONSTANTS.dbName,
    // hostname settings
    host: CONFIG_CONSTANTS.dbHost,
    port: CONFIG_CONSTANTS.dbPort,
    // dialect to use
    dialect: 'postgres',
    // pool settings
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    dialectOptions: {
      ssl: { require: true },
    },
  },
);

/**
 * Connects to PostgreSQL showing an error if failing.
 */
sequelize.authenticate()
  .then(() => {
    debug('PostgreSQL: db initialized.');
    sequelize.sync({ alter: true }).then(() => {
    }).catch((error) => {
      debug('PostgreSQL: unable to sync to the database: %o ', error);
    });
  }).catch((error) => {
    debug('error: %o ', error);
  });

exports.sequelize = sequelize;
