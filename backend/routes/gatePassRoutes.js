const GatePass = require('../models/GatePass');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  GatePass,
  { searchFields: ['name', 'flatNo', 'vehicleNumber'] },
  { read: ['security', 'secretary', 'chairman', 'resident', 'tenant'], write: ['security', 'secretary'] }
);

module.exports = router;
