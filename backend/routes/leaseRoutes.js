const Lease = require('../models/Lease');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Lease,
  { searchFields: ['flatNo', 'tenantName', 'ownerName'] },
  { read: ['admin', 'secretary', 'chairman', 'committee_member', 'tenant', 'resident'], write: ['admin', 'secretary'] }
);

module.exports = router;
