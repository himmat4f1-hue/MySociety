const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const asyncHandler = require('../utils/asyncHandler');

// Public - no auth required, shown on the marketing "Plans & Offers" page
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const plans = await Plan.findAll({ where: { isActive: true }, order: [['pricePerFlatPerMonth', 'ASC']] });
    res.json(plans);
  })
);

module.exports = router;
