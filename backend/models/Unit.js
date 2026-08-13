const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Unit = sequelize.define('Unit', {
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
  flatNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tower: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  areaSqft: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Occupied', 'Vacant', 'Maintenance'),
    defaultValue: 'Vacant',
  },
  // FK -> User
  owner: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  // FK -> User
  resident: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  // Set by the flat's own resident/tenant via the "List Property for Sale"
  // menu - lets Secretary see how many units are currently listed.
  forSale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  askingPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['society', 'flatNo'] },
  ],
});

module.exports = withMongoIdAlias(Unit);
