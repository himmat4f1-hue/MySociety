const Poll = require('../models/Poll');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Poll,
  { searchFields: ['title', 'description'] },
  { read: 'any', write: ['secretary', 'treasurer'] }
);

module.exports = router;
