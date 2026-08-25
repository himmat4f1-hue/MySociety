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
  // FK -> Building / Floor (nullable - only set for flats created via the
  // Society Setup wizard's Building/Floor/Flat builder; tower/floor above
  // stay as the plain display strings the rest of the app already reads
  // everywhere, kept in sync whenever the linked Building/Floor is renamed -
  // see routes/societySetupRoutes.js).
  buildingId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  floorId: {
    type: DataTypes.UUID,
    allowNull: true,
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
  // "Flat Ownership Details" (#31)
  ownersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  managedBy: {
    type: DataTypes.ENUM('Owner', 'Tenant', 'Society', 'None'),
    defaultValue: 'Owner',
  },
}, {
  timestamps: true,
  // Unique per (society, buildingId, floorId, flatNo) - NOT just
  // (society, flatNo). Real societies reuse flat numbers across buildings/
  // floors all the time (e.g. "101" in both Building A and Building B), so
  // a society-wide-only uniqueness constraint is too strict and rejects
  // perfectly normal data (this is exactly what caused 500 errors on the
  // Society Setup wizard's bulk CSV import and the manual Add Flat
  // auto-naming, both of which are scoped per floor, not per society).
  indexes: [
    { unique: true, fields: ['society', 'buildingId', 'floorId', 'flatNo'] },
  ],
});

module.exports = withMongoIdAlias(Unit);
