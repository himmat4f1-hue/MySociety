const Fund = require('../models/Fund');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Fund,
  { searchFields: ['title', 'type'] },
  { read: 'any', write: ['accountant', 'treasurer'] }
);

module.exports = router;
