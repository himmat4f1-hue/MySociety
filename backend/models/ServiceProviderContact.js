const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const ServiceProviderContact = sequelize.define('ServiceProviderContact', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  society: { type: DataTypes.UUID, allowNull: false }, // FK -> Society
  serviceType: { type: DataTypes.STRING, allowNull: false }, // Plumber, Electrician, Lift Maintenance, Pest Control, Security Agency, Gardening, Other
  name: { type: DataTypes.STRING, allowNull: false }, // person or company name
  companyName: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  // Basic contact/photo fields shown in the simplified 6-column list +
  // "More" details card.
  photo: { type: DataTypes.TEXT, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  workTiming: { type: DataTypes.STRING, allowNull: true }, // free text, e.g. "9 AM - 6 PM, Mon-Sat"
  charges: { type: DataTypes.STRING, allowNull: true }, // free text, e.g. "Rs. 500/visit"
  attachmentUrl: { type: DataTypes.TEXT, allowNull: true },
  attachmentName: { type: DataTypes.STRING, allowNull: true },
  attachmentType: { type: DataTypes.STRING, allowNull: true },
  // "Vendor / Contractor Management" (#43)
  contractStart: { type: DataTypes.DATE, allowNull: true },
  contractEnd: { type: DataTypes.DATE, allowNull: true },
  slaDetails: { type: DataTypes.TEXT, allowNull: true },
  rating: { type: DataTypes.FLOAT, allowNull: true }, // 1-5
}, { timestamps: true });

module.exports = withMongoIdAlias(ServiceProviderContact);
