const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const ManagementVote = sequelize.define('ManagementVote', {
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
  // the role being elected for
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // must belong to a committee member
  voterFlatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  candidateFlatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['society', 'electionDate', 'role', 'voterFlatId'] },
  ],
});

module.exports = withMongoIdAlias(ManagementVote);
