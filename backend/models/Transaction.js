const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Transaction = sequelize.define('Transaction', {
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
    type: DataTypes.ENUM('Income', 'Expense'),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // FK -> Fund. Set only for collections/expenses entered against a specific
  // Fund/Celebration via the Celebration & Donation wizard (panels 2 & 3);
  // left null for ordinary Finance-module transactions.
  fund: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('Collected', 'Paid', 'Pending'),
    defaultValue: 'Collected',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Transaction);
