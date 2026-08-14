const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// "Audit Log / Activity Tracker" (#38) - who changed what, when, from where.
// Written automatically by logActivity() (utils/auditLog.js), hooked into
// genericController and flatPrivateController's create/update/delete paths -
// individual routes don't need to call this themselves.
const ActivityLog = sequelize.define('ActivityLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  user: { type: DataTypes.UUID, allowNull: true }, // FK -> User (null for system actions)
  userName: { type: DataTypes.STRING, allowNull: true },
  userRole: { type: DataTypes.STRING, allowNull: true },
  action: { type: DataTypes.ENUM('Create', 'Update', 'Delete'), allowNull: false },
  resourceType: { type: DataTypes.STRING, allowNull: false }, // e.g. "Invoice", "Membership"
  resourceId: { type: DataTypes.STRING, allowNull: true },
  ipAddress: { type: DataTypes.STRING, allowNull: true },
  details: { type: DataTypes.JSONB, defaultValue: {} }, // e.g. { before, after } or just the changed payload
}, { timestamps: true });

module.exports = withMongoIdAlias(ActivityLog);
