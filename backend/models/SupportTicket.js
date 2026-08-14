const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// "Helpdesk / Support Ticket System" (#42) - distinct from Complaints
// (physical/facility issues); this is for general queries to management
// (billing questions, account access, documentation requests, etc.)
const SupportTicket = sequelize.define('SupportTicket', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  raisedBy: { type: DataTypes.UUID, allowNull: true }, // FK -> User
  flatId: { type: DataTypes.STRING, allowNull: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  assignedTo: { type: DataTypes.STRING, allowNull: true }, // management member name
  status: { type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'), defaultValue: 'Open' },
  raisedOn: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  resolvedOn: { type: DataTypes.DATE, allowNull: true },
}, { timestamps: true });

module.exports = withMongoIdAlias(SupportTicket);
