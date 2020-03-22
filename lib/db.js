/* eslint-disable no-undef */
const debug = require('debug')('xilo-auth:db');
const Sequelize = require('sequelize');
require('pg').defaults.ssl = true;

/* ORM connection settings */
sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

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
