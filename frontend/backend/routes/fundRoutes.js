const Fund = require('../models/Fund');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Fund,
  { searchFields: ['title', 'type'] },
  { read: 'any', write: ['admin', 'accountant', 'treasurer'] }
);

module.exports = router;
