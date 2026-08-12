const Meeting = require('../models/Meeting');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Meeting,
  { searchFields: ['title', 'type', 'agenda'] },
  { read: 'any', write: ['secretary', 'treasurer'] }
);

module.exports = router;
