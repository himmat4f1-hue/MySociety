const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Notice = sequelize.define('Notice', {
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
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'All Towers',
  },
  status: {
    type: DataTypes.ENUM('Published', 'Scheduled', 'Archived'),
    defaultValue: 'Published',
  },
  publishedOn: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // FK -> User
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  // Multiple attachments per notice - array of {url, name, type} (same
  // base64-data-URL pattern used elsewhere, e.g. AgendaItem attachments).
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Notice);
