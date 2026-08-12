const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const CameraRequest = sequelize.define('CameraRequest', {
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
  area: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // FK -> User
  requestedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Review', 'Completed'),
    defaultValue: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(CameraRequest);
