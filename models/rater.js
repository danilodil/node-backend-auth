const DataTypes = require('sequelize');
const { sequelize } = require('../lib/db');

const Rater = sequelize.define('Rater', {
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendorName: {
    type: DataTypes.STRING,
  },
  result: {
    type: DataTypes.STRING,
  }
});

module.exports = Rater;
