const Complaint = require('../models/Complaint');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Complaint,
  { searchFields: ['title', 'flatNo', 'category'], populate: 'raisedBy' },
  { read: 'any', write: 'any' }
);

module.exports = router;
