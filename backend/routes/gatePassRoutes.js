const GatePass = require('../models/GatePass');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  GatePass,
  { searchFields: ['name', 'flatNo', 'vehicleNumber'] },
  { read: ['admin', 'security', 'secretary', 'chairman', 'resident', 'tenant'], write: ['admin', 'security', 'secretary'] }
);

module.exports = router;
