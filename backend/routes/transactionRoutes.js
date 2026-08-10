const Transaction = require('../models/Transaction');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Transaction,
  { searchFields: ['description', 'category'] },
  { read: ['admin', 'accountant', 'secretary', 'chairman'], write: ['admin', 'accountant'] }
);

module.exports = router;
