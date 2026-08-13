const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const Unit = require('../models/Unit');
const makeCrudRouter = require('../utils/makeCrudRouter');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Lets the person logged in AS a specific flat (their active session's
// req.flatId - resident or tenant) list/unlist THAT flat for sale, without
// needing Secretary-level Unit write access. Powers the "List Property for
// Sale" option in the member menu; feeds the Secretary dashboard's "No. of
// Properties in Sales" count.
//
// IMPORTANT: these two routes must be registered BEFORE the generic
// /:id CRUD routes below, otherwise Express would match "/my-property"
// as if "my-property" were a Unit id.

// @route GET /api/units/my-property
router.get(
  '/my-property',
  protect,
  asyncHandler(async (req, res) => {
    if (!req.flatId) {
      return res.status(400).json({ message: 'Your account is not linked to a flat.' });
    }
    const unit = await Unit.findOne({ where: { society: req.societyId, flatNo: req.flatId } });
    if (!unit) {
      return res.status(404).json({ message: 'Could not find your flat in the society records.' });
    }
    res.json({ flatNo: unit.flatNo, forSale: unit.forSale, askingPrice: unit.askingPrice });
  })
);

// @route PATCH /api/units/my-property   { forSale, askingPrice? }
router.patch(
  '/my-property',
  protect,
  asyncHandler(async (req, res) => {
    if (!req.flatId) {
      return res.status(400).json({ message: 'Your account is not linked to a flat.' });
    }
    const unit = await Unit.findOne({ where: { society: req.societyId, flatNo: req.flatId } });
    if (!unit) {
      return res.status(404).json({ message: 'Could not find your flat in the society records.' });
    }

    const { forSale, askingPrice } = req.body;
    await unit.update({
      forSale: !!forSale,
      askingPrice: forSale ? (askingPrice ?? unit.askingPrice) : null,
    });
    res.json({ flatNo: unit.flatNo, forSale: unit.forSale, askingPrice: unit.askingPrice });
  })
);

// Generic CRUD (Secretary-only writes, anyone can read) - registered AFTER
// the specific routes above.
router.use(
  '/',
  makeCrudRouter(Unit, { searchFields: ['flatNo', 'tower', 'type'], populate: ['owner', 'resident'] }, { read: 'any', write: ['secretary'] })
);

module.exports = router;
