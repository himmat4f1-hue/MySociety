const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Document = sequelize.define('Document', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'File',
  },
  building: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'All Towers',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  sizeKB: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  isFolder: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // FK -> User
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  uploadedOn: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  // "Document Management System" (#48) - simple version counter + history.
  // Re-uploading the same document increments version and appends the old
  // fileUrl/uploadedOn into previousVersions rather than losing it.
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  previousVersions: {
    type: DataTypes.JSONB,
    defaultValue: [], // [{ version, fileUrl, uploadedBy, uploadedOn }]
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Document);
