/* eslint-disable no-undef */
const debug = require('debug')('xilo-auth:db');
const Sequelize = require('sequelize');
require('pg').defaults.ssl = true;
const CONFIG_CONSTANTS = require('../constants/configConstants').CONFIG;

let dbOptions = {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
}

if (CONFIG_CONSTANTS.nodeEnv === 'local') {
  dbOptions['dialectOptions'] = {
    ssl: false
  };
  dbOptions['protocol'] = 'postgres';
}

// ORM connection settings
let sequelize = new Sequelize(CONFIG_CONSTANTS.dbUrl, dbOptions);

/**
 * Connects to PostgreSQL showing an error if failing.
 */
sequelize.authenticate()
  .then(() => {
    debug('PostgreSQL: db initialized.');
  //  sequelize.sync({ force: true }).then(() => {
  //   }).catch((error) => {
  //     debug('PostgreSQL: unable to sync to the database: %o ', error);
  //   });
  }).catch((error) => {
    debug('error: %o ', error);
  });

exports.sequelize = sequelize;
