const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Supply = sequelize.define('Supply', {
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
  itemName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Cleaning', 'Safety', 'Equipment', 'Others'),
    defaultValue: 'Cleaning',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'pcs',
  },
  status: {
    type: DataTypes.ENUM('In Stock', 'Low Stock', 'Out of Stock'),
    defaultValue: 'In Stock',
  },
  requestedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Supply);
