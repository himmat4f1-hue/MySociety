const Emergency = require('../models/Emergency');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Emergency,
  { searchFields: ['flatNo', 'type'] },
  { read: 'any', write: 'any' }
);

module.exports = router;
