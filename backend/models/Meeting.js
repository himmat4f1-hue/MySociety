const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Meeting = sequelize.define('Meeting', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'General',
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  agenda: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  // array of User ids
  attendees: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  // FK -> User
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  // Meeting lifecycle status - drives the Meetings page UI (Start Meeting /
  // Add Me buttons, and which card layout to show).
  status: {
    type: DataTypes.ENUM('Not yet Started', 'Started', 'Counting Attendance', 'Completed', 'Cancelled'),
    defaultValue: 'Not yet Started',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Meeting);
