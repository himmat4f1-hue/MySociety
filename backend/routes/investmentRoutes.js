const Investment = require('../models/Investment');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Investment,
  { searchFields: ['name', 'kind'] },
  { read: ['accountant', 'secretary', 'chairman', 'treasurer', 'committee_member'], write: ['accountant', 'treasurer'] }
);

module.exports = router;
