const Supply = require('../models/Supply');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Supply,
  { searchFields: ['itemName', 'category'] },
  { read: ['secretary', 'chairman', 'housekeeping'], write: ['secretary', 'housekeeping'] }
);

module.exports = router;
