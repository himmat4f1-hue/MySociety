const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const HomeService = sequelize.define('HomeService', {
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
  type: {
    type: DataTypes.ENUM('Personal Housekeeping', 'School Van', 'House Maid', 'Milk Supplier', 'News Paper Supplier', 'Other'),
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
  photo: {
    type: DataTypes.TEXT, // was STRING(255) - too small for a real base64 image, same bug as FamilyMember had
    allowNull: true,
    defaultValue: '',
  },
  inTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  outTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // "Visitor & Service Provider Limits" / vehicle tracking - if this person
  // drives themselves in, capture their vehicle separately from the
  // resident's own Vehicle records (this is THEIR vehicle, not the flat's).
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(HomeService);
