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
  // For "Cancellation Options" (#16) - lets Secretary/Chairman terminate a
  // specific management/committee appointment, or a whole role, without
  // deleting the person's account or their history.
  terminatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  terminationReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user', 'society', 'role', 'flatId'] },
  ],
});

module.exports = withMongoIdAlias(Membership);
