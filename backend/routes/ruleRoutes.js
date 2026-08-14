const Rule = require('../models/Rule');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(Rule, { searchFields: ['title', 'category'] }, rolesFor('rules'));
