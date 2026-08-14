const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Visitor = sequelize.define('Visitor', {
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
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  residentName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  inTime: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  outTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Inside', 'Checked Out', 'Pre-Approved'),
    defaultValue: 'Inside',
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  // FK -> User
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  // "Visitor & Service Provider Limits" (#22) - how many people this single
  // entry covers (e.g. a family of 4 visiting together = 4, not 4 rows).
  personsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  // "Visitor Management System" (#46) - digital pre-approval by the
  // resident, and a photo captured at the gate.
  preApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  photo: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Their OWN vehicle (if they drove in) - separate from the resident's own
  // Vehicle records, since a visitor's car isn't the flat's registered
  // vehicle.
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Visitor);
