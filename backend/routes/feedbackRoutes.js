const Feedback = require('../models/Feedback');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(Feedback, { searchFields: ['category', 'targetName', 'comments'] }, rolesFor('feedback'));
