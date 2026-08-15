const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const FlatOwner = sequelize.define('FlatOwner', {
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
  // e.g. "G 610" - building + flat no combined, shared by co-owners
  flatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  building: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // 1, 2, 3... distinguishes co-owners on the same flat
  ownerNo: {
    type: DataTypes.INTEGER,
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
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // FK -> User (linked login account, if any)
  user: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['society', 'flatId', 'ownerNo'] },
  ],
});

module.exports = withMongoIdAlias(FlatOwner);
