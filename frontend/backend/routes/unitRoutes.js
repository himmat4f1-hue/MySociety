const Unit = require('../models/Unit');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Unit,
  { searchFields: ['flatNo', 'tower', 'type'], populate: ['owner', 'resident'] },
  { read: 'any', write: ['admin', 'secretary'] }
);

module.exports = router;
