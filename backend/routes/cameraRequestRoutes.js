const CameraRequest = require('../models/CameraRequest');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  CameraRequest,
  { searchFields: ['area', 'reason', 'flatNo'] },
  { read: ['security', 'secretary', 'chairman', 'treasurer', 'committee_member', 'resident', 'tenant'], write: 'any' }
);

module.exports = router;
