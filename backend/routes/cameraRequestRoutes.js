const express = require('express');
const CameraRequest = require('../models/CameraRequest');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { autoFillUser } = require('../middleware/autoFillUser');

const router = express.Router();
router.use(...autoFillUser('requestedBy'));
router.use(
  '/',
  makeCrudRouter(
    CameraRequest,
    { searchFields: ['area', 'reason', 'flatNo'] },
    { read: ['security', 'secretary', 'chairman', 'treasurer', 'committee_member', 'resident', 'tenant'], write: 'any' }
  )
);

module.exports = router;
