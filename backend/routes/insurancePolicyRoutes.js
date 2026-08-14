const InsurancePolicy = require('../models/InsurancePolicy');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(InsurancePolicy, { searchFields: ['policyType', 'provider', 'policyNumber'] }, rolesFor('insurance'));
