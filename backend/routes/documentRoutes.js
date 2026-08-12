const Document = require('../models/Document');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Document,
  { searchFields: ['name', 'category'] },
  { read: 'any', write: ['secretary', 'treasurer', 'accountant'] }
);

module.exports = router;
