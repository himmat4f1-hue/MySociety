const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// "Inventory Management" (#44) - common-area equipment (fire extinguishers,
// CCTV cameras, generators, water pumps, etc.), not consumables (see Supply
// model for consumables like cleaning supplies).
const InventoryItem = sequelize.define('InventoryItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  itemName: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false }, // Fire Safety, Security, Electrical, Plumbing, Other
  location: { type: DataTypes.STRING, allowNull: true },
  installationDate: { type: DataTypes.DATE, allowNull: true },
  warrantyExpiry: { type: DataTypes.DATE, allowNull: true },
  lastServiceDate: { type: DataTypes.DATE, allowNull: true },
  nextServiceDue: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('Working', 'Needs Service', 'Out of Order'), defaultValue: 'Working' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = withMongoIdAlias(InventoryItem);
