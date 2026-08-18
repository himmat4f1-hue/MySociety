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
  // Configurable "who counts as Management, and how many of them" for
  // meeting Attendance/quorum purposes - an array of
  // { role, label, count, enabled }. "Total (Management)" in the Attendance
  // table is the sum of `count` across enabled entries; a role is only
  // treated as "Management" for joined-count/voting-eligibility purposes if
  // it's enabled here. Editable on the Settings page - removing an entry
  // (or disabling it) takes that role out of Management entirely, with no
  // code change needed. See utils/quorum.js.
  managementRoles: {
    type: DataTypes.JSONB,
    defaultValue: [
      { role: 'secretary', label: 'Secretary', count: 1, enabled: true },
      { role: 'chairman', label: 'Chairman', count: 1, enabled: true },
      { role: 'treasurer', label: 'Treasurer', count: 1, enabled: true },
      { role: 'accountant', label: 'Accountant', count: 1, enabled: true },
      { role: 'committee_member', label: 'Committee Member', count: 5, enabled: true },
    ],
  },
}, { timestamps: true });

module.exports = withMongoIdAlias(MeetingSettings);

