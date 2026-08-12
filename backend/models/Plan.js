const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  pricePerFlatPerMonth: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  minFlats: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  // 0 = unlimited
  maxFlats: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Plan);
