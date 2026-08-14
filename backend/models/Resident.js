const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

const Resident = sequelize.define('Resident', {
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
  // FK -> User
  user: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  flatNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tower: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Owner', 'Tenant'),
    defaultValue: 'Owner',
  },
  moveInDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  // array of {name, relation, age}
  familyMembers: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  // array of {type, number}
  vehicles: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  // {name, phone}
  emergencyContact: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  // "Member Onboarding / Offboarding" (#39)
  moveOutDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // array of {label, completed} - e.g. NOC from society, dues cleared, keys handed over
  onboardingChecklist: {
    type: DataTypes.JSONB,
    defaultValue: [
      { label: 'ID proof submitted', completed: false },
      { label: 'NOC from society', completed: false },
      { label: 'Maintenance deposit collected', completed: false },
      { label: 'Keys/access cards issued', completed: false },
    ],
  },
  offboardingChecklist: {
    type: DataTypes.JSONB,
    defaultValue: [
      { label: 'Outstanding dues cleared', completed: false },
      { label: 'Society NOC issued', completed: false },
      { label: 'Keys/access cards returned', completed: false },
      { label: 'Final handover inspection done', completed: false },
    ],
  },
  // "Resident Directory" (#52) - when false, this resident's contact info
  // (phone/email, resolved from the linked User) is hidden from the
  // directory for everyone except Secretary/Chairman.
  directoryVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(Resident);
