const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Vehicle = sequelize.define('Vehicle', {
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
  flatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicleType: {
    type: DataTypes.ENUM('Lauri', 'Truck', 'Bike', 'Scooter', 'Auto Rickshaw', 'Car', 'Tempo'),
    allowNull: false,
  },
  fuelType: {
    type: DataTypes.ENUM('CNG', 'Petrol', 'Electric'),
    defaultValue: 'Petrol',
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  registrationNo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  photo: {
    type: DataTypes.TEXT, // was STRING(255) - too small for a real base64 image, same bug as FamilyMember had
    allowNull: true,
    defaultValue: '',
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Vehicle);
