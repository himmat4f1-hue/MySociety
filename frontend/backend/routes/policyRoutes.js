const Policy = require('../models/Policy');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Policy,
  { searchFields: ['title'] },
  { read: 'any', write: ['admin', 'secretary', 'chairman', 'treasurer'] }
);

module.exports = router;
