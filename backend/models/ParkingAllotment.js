const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const ParkingAllotment = sequelize.define('ParkingAllotment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false }, // FK -> Society
  spotNumber: { type: DataTypes.STRING, allowNull: false }, // e.g. "B-12"
  spotType: { type: DataTypes.ENUM('Covered', 'Open', 'Stilt', 'Basement'), defaultValue: 'Open' },
  flatId: { type: DataTypes.STRING, allowNull: true }, // which flat it's allotted to (null = unallotted)
  vehicleNumber: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('Allotted', 'Vacant', 'Reserved'), defaultValue: 'Vacant' },
}, {
  timestamps: true,
  indexes: [{ unique: true, fields: ['society', 'spotNumber'] }],
});

module.exports = withMongoIdAlias(ParkingAllotment);
