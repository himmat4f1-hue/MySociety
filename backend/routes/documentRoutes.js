const Document = require('../models/Document');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Document,
  { searchFields: ['name', 'category'] },
  { read: 'any', write: ['admin', 'secretary', 'chairman'] }
);

module.exports = router;
