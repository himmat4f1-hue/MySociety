const Task = require('../models/Task');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Task,
  { searchFields: ['title', 'area', 'assignedTo'] },
  { read: ['admin', 'secretary', 'chairman', 'housekeeping'], write: ['admin', 'secretary', 'housekeeping'] }
);

module.exports = router;
