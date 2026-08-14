const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Shift = sequelize.define('Shift', {
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
  staffName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('Security', 'Housekeeping'),
    allowNull: false,
  },
  shiftType: {
    type: DataTypes.ENUM('Morning', 'Evening', 'Night'),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Present', 'Absent', 'On Leave'),
    defaultValue: 'Scheduled',
  },
  // Actual check-in/check-out (distinct from the scheduled startTime/endTime
  // above) - "Staff Attendance Management" (#21): In/Out time tracking.
  actualInTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  actualOutTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  leaveReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  handoverNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Shift);
