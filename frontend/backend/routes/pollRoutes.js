const Poll = require('../models/Poll');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Poll,
  { searchFields: ['title', 'description'] },
  { read: 'any', write: ['admin', 'secretary', 'chairman', 'treasurer'] }
);

module.exports = router;
