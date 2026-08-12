const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Amenity = sequelize.define('Amenity', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'All Towers',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('Available', 'Under Maintenance', 'Out of Service'),
    defaultValue: 'Available',
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // array of {resident, residentName, date, fromTime, toTime, status}
  bookings: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Amenity);
