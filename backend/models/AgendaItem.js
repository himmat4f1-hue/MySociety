const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const AgendaItem = sequelize.define('AgendaItem', {
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
  agenda: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  managementDecision: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  agendaStatus: {
    type: DataTypes.ENUM('Not Started', 'In Discussion', 'Postponed', 'Resolved', 'Rejected'),
    defaultValue: 'Not Started',
  },
  noOfVotes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  // internal dedup list of User ids - never exposed via API
  voters: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
  estimatedStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimatedEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(AgendaItem);
