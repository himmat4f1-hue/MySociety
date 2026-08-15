const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Fund = sequelize.define('Fund', {
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
  type: {
    type: DataTypes.ENUM('Required', 'Celebration'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Start Date/Time for a Celebration/Donation fund (Required-type funds
  // don't use this - only the Celebration wizard's "Create/Edit" panel does).
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Used as "Minimum Amount Required" on the Celebration Fund
  // Create/Edit panel and the Report/Summary panel.
  targetAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  collectedAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  expenseAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Open', 'Closed'),
    defaultValue: 'Open',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Fund);
