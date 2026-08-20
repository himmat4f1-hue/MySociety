const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// Secretary-managed schedule of "from this month onward, maintenance is
// Rs. X/flat/month, with Rs. Y penalty if unpaid". Applies society-wide (one
// amount for every flat) - there's no separate schedule per flat. To find
// the amount that applies in a given month, take the LATEST entry whose
// effectiveFromMonth <= that month (see frontend/src/pages/MaintenanceCharges.jsx).
const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
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
  // First-of-month date this rate takes effect from (inclusive).
  effectiveFromMonth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // Flat one-time late fee added if a month's dues remain unpaid past that
  // month - not compounding, just a single fixed penalty per overdue month.
  penaltyAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  // Reference to the meeting where this rate/schedule change was decided -
  // denormalized (title/date copied in) so the reference still reads fine
  // even if that Meeting is later deleted. meetingId is optional: a
  // schedule entry can also just carry a free-text reference/notes instead.
  meetingId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  meetingTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meetingDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(MaintenanceSchedule);
