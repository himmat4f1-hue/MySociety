const express = require('express');
const ConfigList = require('../models/ConfigList');
const makeCrudRouter = require('../utils/makeCrudRouter');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/config-lists/values/:category - returns just the values
// array for one category, e.g. GET /api/config-lists/values/petTypes ->
// { category: 'petTypes', values: ['Dog','Cat',...] }. Any authenticated
// member can read (needed to populate dropdowns); only Secretary can manage
// the lists themselves (see the generic CRUD routes below).
router.get(
  '/values/:category',
  protect,
  asyncHandler(async (req, res) => {
    const row = await ConfigList.findOne({ where: { society: req.societyId, category: req.params.category } });
    res.json({ category: req.params.category, values: row?.values || [] });
  })
);

router.use('/', makeCrudRouter(ConfigList, { searchFields: ['category', 'label'] }, { read: ['secretary', 'chairman'], write: ['secretary'] }));

module.exports = router;
