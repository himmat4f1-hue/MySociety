const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Pet = sequelize.define('Pet', {
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
  type: {
    type: DataTypes.ENUM('Dog', 'Cat', 'Bird', 'Fish', 'Other'),
    defaultValue: 'Dog',
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  flatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vaccinated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  // Base64 data-URL (e.g. "data:image/jpeg;base64,...") - "Image Display"
  // (#23). No external file storage is wired up, so images are stored
  // inline; frontend caps upload size before sending, see PhotoUpload.jsx.
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Pet);
