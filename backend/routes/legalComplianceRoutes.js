const LegalCompliance = require('../models/LegalCompliance');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(LegalCompliance, { searchFields: ['title', 'complianceType', 'authority'] }, rolesFor('legalCompliance'));
