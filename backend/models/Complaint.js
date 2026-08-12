const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Complaint = sequelize.define('Complaint', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('Housekeeping', 'Lift', 'Camera', 'Electrical', 'Plumbing', 'Other'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  status: {
    type: DataTypes.ENUM('Open', 'In Process', 'Resolved'),
    defaultValue: 'Open',
  },
  // spec-based flat identity (e.g. "G 610")
  flatId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // FK -> User
  raisedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  raisedOn: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  resolvedOn: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Complaint);
