const Invoice = require('../models/Invoice');
const makeCrudRouter = require('../utils/makeCrudRouter');

const router = makeCrudRouter(
  Invoice,
  { searchFields: ['invoiceNo', 'flatNo', 'residentName'] },
  { read: 'any', write: ['admin', 'accountant'] }
);

module.exports = router;
