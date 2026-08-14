const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// "Water & Electricity Usage Tracking" (#45) - per flat/tower/common-area
// monthly consumption, for comparison reports and abnormal-usage alerts.
const UtilityReading = sequelize.define('UtilityReading', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  utilityType: { type: DataTypes.ENUM('Water', 'Electricity'), allowNull: false },
  scope: { type: DataTypes.ENUM('Flat', 'Tower', 'Common Area'), defaultValue: 'Flat' },
  flatId: { type: DataTypes.STRING, allowNull: true }, // set when scope = Flat
  tower: { type: DataTypes.STRING, allowNull: true }, // set when scope = Tower or Flat
  month: { type: DataTypes.DATEONLY, allowNull: false }, // 1st of the billing month
  unitsConsumed: { type: DataTypes.FLOAT, allowNull: false }, // kWh or KL
  isAbnormal: { type: DataTypes.BOOLEAN, defaultValue: false }, // flagged vs typical usage
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = withMongoIdAlias(UtilityReading);
