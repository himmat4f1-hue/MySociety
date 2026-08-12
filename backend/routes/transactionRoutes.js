const Transaction = require('../models/Transaction');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Transaction,
  { searchFields: ['description', 'category'] },
  { read: ['accountant', 'secretary', 'chairman', 'treasurer', 'committee_member'], write: ['accountant', 'treasurer'] }
);

module.exports = router;
