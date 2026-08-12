const Lease = require('../models/Lease');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Lease,
  { searchFields: ['flatNo', 'tenantName', 'ownerName'] },
  { read: ['secretary', 'chairman', 'committee_member', 'tenant', 'resident'], write: ['secretary'] }
);

module.exports = router;
