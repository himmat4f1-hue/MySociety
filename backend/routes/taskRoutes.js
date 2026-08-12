const Task = require('../models/Task');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Task,
  { searchFields: ['title', 'area', 'assignedTo'] },
  { read: ['secretary', 'chairman', 'housekeeping'], write: ['secretary', 'housekeeping'] }
);

module.exports = router;
