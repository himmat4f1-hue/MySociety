const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const MeetingAttendance = sequelize.define('MeetingAttendance', {
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
  // FK -> Meeting
  meeting: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // captured from the checking-in user's active role
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flatId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // FK -> User
  user: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // Snapshot of the joiner's name at check-in time, so the "List of
  // Joiners" table doesn't need a User join for every render.
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['meeting', 'user'] },
  ],
});

module.exports = withMongoIdAlias(MeetingAttendance);
