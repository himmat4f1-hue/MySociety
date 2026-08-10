const CameraRequest = require('../models/CameraRequest');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  CameraRequest,
  { searchFields: ['area', 'reason', 'flatNo'] },
  { read: ['admin', 'security', 'secretary', 'chairman'], write: 'any' }
);

module.exports = router;
