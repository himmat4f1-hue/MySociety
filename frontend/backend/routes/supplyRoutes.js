const Supply = require('../models/Supply');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Supply,
  { searchFields: ['itemName', 'category'] },
  { read: ['admin', 'secretary', 'chairman', 'housekeeping'], write: ['admin', 'secretary', 'housekeeping'] }
);

module.exports = router;
