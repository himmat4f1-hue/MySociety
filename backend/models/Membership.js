const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Membership = sequelize.define('Membership', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // FK -> User
  user: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // FK -> Society
  society: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant', 'housekeeping'),
    allowNull: false,
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tower: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // e.g. "A-101" - only meaningful for owner/tenant-type roles
  flatId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user', 'society', 'role', 'flatId'] },
  ],
});

module.exports = withMongoIdAlias(Membership);
