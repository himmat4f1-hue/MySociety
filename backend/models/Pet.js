const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Pet = sequelize.define('Pet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // FK -> Society
  society: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Dog', 'Cat', 'Bird', 'Fish', 'Other'),
    defaultValue: 'Dog',
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  flatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vaccinated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Pet);
