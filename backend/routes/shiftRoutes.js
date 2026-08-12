const Shift = require('../models/Shift');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Shift,
  { searchFields: ['staffName', 'shiftType'] },
  { read: ['security', 'secretary', 'chairman', 'housekeeping'], write: ['security', 'secretary', 'housekeeping'] }
);

module.exports = router;
