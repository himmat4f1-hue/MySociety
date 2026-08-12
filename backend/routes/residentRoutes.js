const Resident = require('../models/Resident');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Resident,
  { searchFields: ['flatNo', 'tower'], populate: 'user' },
  { read: 'any', write: ['secretary'] }
);

module.exports = router;
