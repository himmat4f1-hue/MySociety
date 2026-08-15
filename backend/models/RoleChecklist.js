const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// Per-role checklist (#4) - e.g. a Housekeeping checklist with individual
// tasks that can be checked off, added, and removed. One row per role;
// `items` is an array of {id, text, done} - NOT a single free-text blob.
const RoleChecklist = sequelize.define('RoleChecklist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  society: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: [], // [{ id, text, done }]
  },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['society', 'role'] }],
});

module.exports = withMongoIdAlias(RoleChecklist);
