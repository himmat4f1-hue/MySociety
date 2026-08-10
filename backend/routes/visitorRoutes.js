const Visitor = require('../models/Visitor');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Visitor,
  { searchFields: ['name', 'mobile', 'flatNo', 'purpose'] },
  { read: 'any', write: ['admin', 'security', 'secretary'] }
);

module.exports = router;
