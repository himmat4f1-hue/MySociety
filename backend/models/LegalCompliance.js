const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// "Legal Compliance Tracker" (#60) - municipal, fire safety, labour, tax
// (GST/TDS) compliance items with renewal deadlines.
const LegalCompliance = sequelize.define('LegalCompliance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false },
  complianceType: { type: DataTypes.ENUM('Municipal', 'Fire Safety', 'Labour', 'Tax (GST/TDS)', 'Other'), allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  authority: { type: DataTypes.STRING, allowNull: true }, // issuing body
  lastRenewedOn: { type: DataTypes.DATE, allowNull: true },
  nextDueDate: { type: DataTypes.DATE, allowNull: true },
  status: { type: DataTypes.ENUM('Compliant', 'Due Soon', 'Overdue'), defaultValue: 'Compliant' },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { timestamps: true });

module.exports = withMongoIdAlias(LegalCompliance);
