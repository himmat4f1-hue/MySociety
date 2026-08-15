const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// Society-wide meeting quorum settings (Settings page, #6) - ONE row per
// society, applies to every meeting automatically. NOT set per-meeting.
const MeetingSettings = sequelize.define('MeetingSettings', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false, unique: true },
  minRequiredMembers: { type: DataTypes.INTEGER, defaultValue: 1 },
  minRequiredManagement: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { timestamps: true });

module.exports = withMongoIdAlias(MeetingSettings);
