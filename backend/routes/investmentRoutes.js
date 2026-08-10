const Investment = require('../models/Investment');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Investment,
  { searchFields: ['name', 'kind'] },
  { read: ['admin', 'accountant', 'secretary', 'chairman'], write: ['admin', 'accountant'] }
);

module.exports = router;
