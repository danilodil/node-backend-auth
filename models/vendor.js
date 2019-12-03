const DataTypes = require('sequelize');
const { sequelize } = require('../lib/db');

const Vendor = sequelize.define('Vendor', {
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendorName: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
  },
  salesforceAT: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  carrier: {
    type: DataTypes.STRING,
  },
  agentId: {
    type: DataTypes.INTEGER,
  },
  agency: {
    type: DataTypes.STRING,
  },
});

module.exports = Vendor;
