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
  // Meeting lifecycle - simplified to 4 states matching the actual UI flow:
  // Upcoming (before Secretary starts attendance) -> In Progress (people can
  // Add Me / vote once joined) -> Completed (Secretary stops it) or
  // Cancelled (Secretary cancels, possible from Upcoming OR In Progress).
  status: {
    type: DataTypes.ENUM('Upcoming', 'In Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Upcoming',
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  // Quorum - minimum joiners required before voting is meaningful. Members =
  // resident/tenant headcount (relevant for General meetings); Management =
  // secretary/chairman/treasurer/committee_member headcount (relevant for
  // Committee meetings). Both are shown, but only the one matching this
  // meeting's `type` actually gates the "Please wait" state.
  minRequiredMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  minRequiredManagement: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Meeting);
