const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Emergency = sequelize.define('Emergency', {
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
  type: {
    type: DataTypes.ENUM('Medical', 'Security', 'Fire/Safety', 'Other'),
    allowNull: false,
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // FK -> User
  raisedBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('Active', 'Resolved'),
    defaultValue: 'Active',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Emergency);
