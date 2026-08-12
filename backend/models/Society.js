const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Society = sequelize.define('Society', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    trim: true,
  },
  logo: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Plans',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('Apartment', 'IndividualHouses'),
    defaultValue: 'Apartment',
  },
  buildingsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  totalFlats: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isGuestSandbox: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Suspended', 'Trial'),
    defaultValue: 'Trial',
  },
}, {
  timestamps: true,
});

module.exports = Society;
