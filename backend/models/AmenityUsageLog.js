const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// Formal, queryable record of amenity bookings/usage - "records of who used
// which amenity and when" (replaces the old Amenity.bookings JSONB blob,
// which couldn't be filtered/joined/reported on).
const AmenityUsageLog = sequelize.define('AmenityUsageLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false }, // FK -> Society
  amenity: { type: DataTypes.UUID, allowNull: false }, // FK -> Amenity
  user: { type: DataTypes.UUID, allowNull: true }, // FK -> User (who booked/used it)
  flatId: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  fromTime: { type: DataTypes.STRING, allowNull: true },
  toTime: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('Booked', 'Completed', 'Cancelled', 'No-show'), defaultValue: 'Booked' },
}, { timestamps: true });

module.exports = withMongoIdAlias(AmenityUsageLog);
