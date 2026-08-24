const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// A floor within a Building, created via the Society Setup wizard's "Add
// Floor" button BEFORE any flats exist on it - Units (flats) are added
// under a Floor afterward, not the other way around. See
// routes/societySetupRoutes.js.
const Floor = sequelize.define('Floor', {
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
  // FK -> Building
  buildingId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Floor);
