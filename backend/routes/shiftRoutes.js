const Shift = require('../models/Shift');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Shift,
  { searchFields: ['staffName', 'shiftType'] },
  { read: ['admin', 'security', 'secretary', 'chairman', 'housekeeping'], write: ['admin', 'security', 'secretary', 'housekeeping'] }
);

module.exports = router;
