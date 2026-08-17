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
  // Set when this person clicks "Exit from Meeting". Attendance itself is
  // NOT removed (they're still counted for quorum) - this only tracks that
  // they've left the live session, so the "Exit from Meeting" button can
  // stay hidden if they open the meeting again afterwards.
  exitedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  // Unique per (meeting, user, role, flatId) - NOT just (meeting, user,
  // role). The same login can hold multiple memberships with the SAME role
  // too (e.g. Resident/Owner of two different flats), and each flat's
  // attendance needs to be tracked - and count toward quorum - separately.
  indexes: [
    { unique: true, fields: ['meeting', 'user', 'role', 'flatId'] },
  ],
});

module.exports = withMongoIdAlias(MeetingAttendance);
