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
  quoteId: {
    type: DataTypes.STRING,
  },
  vendorName: {
    type: DataTypes.STRING,
  },
  totalPremium: {
    type: DataTypes.STRING,
  },
  months: {
    type: DataTypes.STRING,
  },
  downPayment: {
    type: DataTypes.STRING,
  },
  error: {
    type: DataTypes.STRING,
  },
  succeeded: {
    type: DataTypes.BOOLEAN,
  },
  stepResult: {
    type: DataTypes.JSON,
  },
  quoteIds: {
    type: DataTypes.JSON,
  },
  productType: {
    type: DataTypes.STRING,
  },
  url: {
    type: DataTypes.STRING,
  },
});

module.exports = Rater;
