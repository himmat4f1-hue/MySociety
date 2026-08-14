const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Lease = sequelize.define('Lease', {
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
  flatNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tower: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  tenantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ownerName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  leaseStart: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  leaseEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  monthlyRent: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  securityDeposit: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Expiring Soon', 'Expired', 'Renewed', 'Pending'),
    defaultValue: 'Active',
  },
  policeVerificationStatus: {
    type: DataTypes.ENUM('Not Submitted', 'Submitted', 'Verified', 'Rejected'),
    defaultValue: 'Not Submitted',
  },
  maintenanceCharges: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Lease);
