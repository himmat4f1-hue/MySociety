const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Poll = sequelize.define('Poll', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Closed'),
    defaultValue: 'Active',
  },
  votesYes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  votesNo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  totalEligible: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  voters: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  // "Survey / Poll System" (#50) - when true, the frontend never displays
  // who voted which way (voters[] is still tracked internally only to
  // enforce one-vote-per-person, never exposed alongside vote choice).
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // FK -> User
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Poll);
