const Investment = require('../models/Investment');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Investment,
  { searchFields: ['name', 'kind'] },
  { read: ['admin', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member'], write: ['admin', 'accountant', 'treasurer'] }
);

module.exports = router;
