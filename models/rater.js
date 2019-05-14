const DataTypes = require('sequelize');
const { sequelize } = require('../lib/db');

const Rater = sequelize.define('Rater', {
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendorName: {
    type: DataTypes.STRING,
  },
  totalPremium: {
    type: DataTypes.STRING,
  },
  result: {
    type: DataTypes.STRING,
  },
  succeeded: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = Rater;
