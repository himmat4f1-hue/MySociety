const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// "Insurance Management" (#49)
const InsurancePolicy = sequelize.define('InsurancePolicy', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  policyType: { type: DataTypes.STRING, allowNull: false }, // Fire, Burglary, Public Liability, Structure, Other
  provider: { type: DataTypes.STRING, allowNull: false },
  policyNumber: { type: DataTypes.STRING, allowNull: true },
  coverageAmount: { type: DataTypes.FLOAT, allowNull: true },
  premiumAmount: { type: DataTypes.FLOAT, allowNull: true },
  policyStart: { type: DataTypes.DATE, allowNull: true },
  policyEnd: { type: DataTypes.DATE, allowNull: true },
  claimHistory: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Expired', 'Cancelled'), defaultValue: 'Active' },
}, { timestamps: true });

module.exports = withMongoIdAlias(InsurancePolicy);
