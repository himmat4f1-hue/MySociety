const express = require('express');
const Emergency = require('../models/Emergency');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { autoFillUser } = require('../middleware/autoFillUser');

const router = express.Router();
router.use(...autoFillUser('raisedBy'));
router.use('/', makeCrudRouter(Emergency, { searchFields: ['flatNo', 'type'] }, { read: 'any', write: 'any' }));

module.exports = router;
