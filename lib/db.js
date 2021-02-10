/* eslint-disable dot-notation, no-undef */
const debug = require('debug')('xilo-auth:db');
const Sequelize = require('sequelize');
require('pg').defaults.ssl = true;
const CONFIG_CONSTANTS = require('../constants/configConstants').CONFIG;

const dbOptions = {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
};

if (CONFIG_CONSTANTS.nodeEnv === 'local') {
  dbOptions['dialectOptions'] = {
    ssl: false,
  };
  dbOptions['protocol'] = 'postgres';
}

// ORM connection settings
let sequelize = null;

/**
 * Connects to PostgreSQL showing an error if failing.
 */
try {
  sequelize = new Sequelize(CONFIG_CONSTANTS.dbUrl, dbOptions);
  console.log(sequelize);
  sequelize.authenticate()
  .then(() => {
    console.log('PG initialized');
  //  sequelize.sync({ force: true }).then(() => {
  //   }).catch((error) => {
  //     debug('PostgreSQL: unable to sync to the database: %o ', error);
  //   });
  }).catch((error) => {
    console.log('error: %o ', error);
    // debug('error: %o ', error);
  });
} catch (error) {
  console.log(error);
}

exports.sequelize = sequelize;
