const Transaction = require('../models/Transaction');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Transaction,
  { searchFields: ['description', 'category'] },
  { read: ['admin', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member'], write: ['admin', 'accountant', 'treasurer'] }
);

module.exports = router;
