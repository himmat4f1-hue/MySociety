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
  // No longer collected in the simplified Amenities UI (Photo/Name/Status/
  // Rules only) - kept nullable rather than removed so existing data and
  // any other code path that still reads it doesn't break.
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'General',
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
    type: DataTypes.ENUM('Available', 'Not Available', 'Under Maintenance', 'Out of Service'),
    defaultValue: 'Available',
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  used: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Amenity-specific rules, shown via the "Click here" link in the Rules
  // column and editable by the Secretary in that same card - array of
  // plain strings, one per rule line.
  rules: {
    type: DataTypes.JSONB,
    defaultValue: [],
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
