const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// Society-configurable dropdown lists - "Settings" (#4): which pet types,
// vehicle types, home-service types, etc. are ALLOWED for this society.
// Whatever is listed here is exactly what shows up in the corresponding
// dropdown across the app (Pets/Vehicles/Home Services forms) - nothing
// hardcoded beyond the built-in fallback if a category has never been set up.
const ConfigList = sequelize.define('ConfigList', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false }, // e.g. 'petTypes', 'vehicleTypes', 'homeServiceTypes'
  label: { type: DataTypes.STRING, allowNull: false }, // display name, e.g. "Pet Types"
  values: { type: DataTypes.JSONB, defaultValue: [] }, // e.g. ['Dog', 'Cat', 'Bird']
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['society', 'category'] }],
});

module.exports = withMongoIdAlias(ConfigList);
