const express = require('express');
const Maintenance = require('../models/Maintenance');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { autoFillUser } = require('../middleware/autoFillUser');

const router = express.Router();
router.use(...autoFillUser('raisedBy'));
router.use('/', makeCrudRouter(Maintenance, { searchFields: ['title', 'flatNo', 'category'], populate: 'raisedBy' }, { read: 'any', write: 'any' }));

module.exports = router;
