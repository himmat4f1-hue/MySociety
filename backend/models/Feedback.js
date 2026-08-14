const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// "Member Feedback & Ratings" (#59) - rate management, amenities, meetings.
const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  submittedBy: { type: DataTypes.UUID, allowNull: true }, // FK -> User
  flatId: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.ENUM('Management', 'Amenities', 'Meeting', 'Staff', 'Other'), allowNull: false },
  targetName: { type: DataTypes.STRING, allowNull: true }, // e.g. which amenity/meeting this is about
  rating: { type: DataTypes.INTEGER, allowNull: false }, // 1-5
  comments: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = withMongoIdAlias(Feedback);
