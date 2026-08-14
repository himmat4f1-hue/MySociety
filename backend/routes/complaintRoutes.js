const express = require('express');
const Complaint = require('../models/Complaint');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { autoFillUser } = require('../middleware/autoFillUser');

const router = express.Router();
router.use(...autoFillUser('raisedBy'));
router.use('/', makeCrudRouter(Complaint, { searchFields: ['title', 'flatNo', 'category'], populate: 'raisedBy' }, { read: 'any', write: 'any' }));

module.exports = router;
