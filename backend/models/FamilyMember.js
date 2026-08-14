const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const FamilyMember = sequelize.define('FamilyMember', {
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
  flatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middleName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    defaultValue: 'Male',
  },
  religion: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // Base64 data-URL - was DataTypes.STRING (VARCHAR 255) before, which is
  // far too small to hold an actual image and would have silently
  // truncated/errored on any real photo upload. Fixed to TEXT.
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  // true for rows auto-created from FlatOwner
  isAutoAddedOwner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(FamilyMember);
