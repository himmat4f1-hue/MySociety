const Maintenance = require('../models/Maintenance');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Maintenance,
  { searchFields: ['title', 'flatNo', 'category'], populate: 'raisedBy' },
  { read: 'any', write: 'any' }
);

module.exports = router;
