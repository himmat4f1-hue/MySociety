const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Society = sequelize.define('Society', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    trim: true,
  },
  logo: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  // A society's public "listing" is its (name, zipCode) pair - checked for
  // availability at signup Step 1 (see authController.checkSocietyAvailability)
  // so two societies can't register under the same name+zip.
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // False until the Secretary finishes the Society Setup wizard (Building /
  // Floor / Flat builder + picking their own flat) - see
  // routes/societySetupRoutes.js. A freshly-registered society has no
  // buildings/units at all yet.
  isSetupComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  plan: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('Apartment', 'IndividualHouses'),
    defaultValue: 'Apartment',
  },
  buildingsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  totalFlats: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isGuestSandbox: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Suspended', 'Trial'),
    defaultValue: 'Trial',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Society);
