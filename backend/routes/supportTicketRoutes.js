const SupportTicket = require('../models/SupportTicket');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { rolesFor } = require('../config/permissions');

module.exports = makeCrudRouter(SupportTicket, { searchFields: ['subject', 'flatId'] }, rolesFor('supportTickets'));
