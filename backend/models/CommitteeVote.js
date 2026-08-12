const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const CommitteeVote = sequelize.define('CommitteeVote', {
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
  electionDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // the flat casting the vote
  voterFlatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // the flat/owner being voted for
  candidateFlatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['society', 'electionDate', 'voterFlatId'] },
  ],
});

module.exports = withMongoIdAlias(CommitteeVote);
