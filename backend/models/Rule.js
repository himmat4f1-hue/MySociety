const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Rule = sequelize.define('Rule', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false }, // FK -> Society
  category: { type: DataTypes.STRING, allowNull: false }, // e.g. 'Parking', 'Noise', 'Pets', 'Common Areas'
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  effectiveFrom: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: true });

module.exports = withMongoIdAlias(Rule);
