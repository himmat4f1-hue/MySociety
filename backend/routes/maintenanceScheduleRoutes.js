const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  MaintenanceSchedule,
  { searchFields: ['meetingTitle', 'notes'] },
  { read: 'any', write: ['secretary'] }
);

module.exports = router;
