const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { withMongoIdAlias } = require('../utils/modelHelpers');

// One row per payment a flat makes toward a specific month's maintenance
// due - deliberately NOT one-row-per-month, so a flat can pay in several
// installments and still see "how many times, how much" for that month
// (see frontend/src/pages/MaintenanceCharges.jsx). Private-per-flat model,
// same access pattern as FamilyMember/Pet (see
// backend/controllers/flatPrivateController.js) but Secretary-only write -
// a flat's own resident/tenant can see their payments here but not add one
// themselves (payments are recorded by the Secretary against real
// bank/cash receipts).
const MaintenancePayment = sequelize.define('MaintenancePayment', {
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
  // spec-based flat identity (e.g. "A-101") - matches FamilyMember/Pet/etc.
  flatId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // Which month's due this payment is applied toward (first-of-month date) -
  // NOT necessarily the date the payment was made (see paidOn).
  month: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  paidOn: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = withMongoIdAlias(MaintenancePayment);
