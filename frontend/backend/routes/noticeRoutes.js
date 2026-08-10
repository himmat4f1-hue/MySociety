const Notice = require('../models/Notice');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Notice,
  { searchFields: ['title', 'description', 'category'] },
  { read: 'any', write: ['admin', 'secretary', 'chairman', 'treasurer'] }
);

module.exports = router;
