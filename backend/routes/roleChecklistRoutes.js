const RoleChecklist = require('../models/RoleChecklist');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  RoleChecklist,
  { searchFields: ['role', 'responsibilities'] },
  { read: 'any', write: ['secretary'] }
);

module.exports = router;
