const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const Society = require('../models/Society');
const Building = require('../models/Building');
const Floor = require('../models/Floor');
const Unit = require('../models/Unit');
const Membership = require('../models/Membership');
const generateToken = require('../utils/generateToken');

// Powers the post-registration "Society Setup" wizard: Secretary picks
// Flat vs Individual Housing, then builds out Building -> Floor -> Flat one
// piece at a time (Add Building, then per-building Add Floor, then
// per-floor Add Flat, with Rename at every level), and finally picks which
// flat is their own to finish. Secretary-only - this is setup/admin work,
// not something any other role touches.

// @route GET /api/society-setup/structure - the full nested tree for the
// wizard UI: every Building, each with its Floors, each with its Flats.
router.get(
  '/structure',
  protect,
  asyncHandler(async (req, res) => {
    const [society, buildings, floors, units] = await Promise.all([
      Society.findByPk(req.societyId),
      Building.findAll({ where: { society: req.societyId }, order: [['createdAt', 'ASC']] }),
      Floor.findAll({ where: { society: req.societyId }, order: [['createdAt', 'ASC']] }),
      Unit.findAll({ where: { society: req.societyId }, order: [['createdAt', 'ASC']] }),
    ]);

    const tree = buildings.map((b) => ({
      _id: b.id,
      name: b.name,
      floors: floors
        .filter((f) => f.buildingId === b.id)
        .map((f) => ({
          _id: f.id,
          name: f.name,
          flats: units.filter((u) => u.floorId === f.id).map((u) => ({ _id: u.id, flatNo: u.flatNo })),
        })),
    }));

    res.json({
      type: society.type,
      isSetupComplete: society.isSetupComplete,
      buildings: tree,
      // Flat list for the final "pick your own flat" step - only flats that
      // actually exist, regardless of which building/floor.
      allFlats: units.map((u) => ({ _id: u.id, flatNo: u.flatNo, tower: u.tower, floor: u.floor })),
    });
  })
);

// @route POST /api/society-setup/type { type: 'Apartment' | 'IndividualHouses' }
router.post(
  '/type',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const type = req.body.type === 'IndividualHouses' ? 'IndividualHouses' : 'Apartment';
    const society = await Society.findByPk(req.societyId);
    await society.update({ type });
    res.json({ type });
  })
);

// @route POST /api/society-setup/buildings - "Add Building": one new
// building row, auto-named (renamed afterward via PUT below).
router.post(
  '/buildings',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const count = await Building.count({ where: { society: req.societyId } });
    const building = await Building.create({ society: req.societyId, name: `Building ${count + 1}` });
    res.status(201).json(building);
  })
);

// @route PUT /api/society-setup/buildings/:id { name } - "Rename". Cascades
// the new name into every flat currently under this building's tower
// string, so existing Units stay consistent with the renamed Building.
router.put(
  '/buildings/:id',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const building = await Building.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!building) return res.status(404).json({ message: 'Not found' });
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    await building.update({ name });
    await Unit.update({ tower: name }, { where: { buildingId: building.id, society: req.societyId } });
    res.json(building);
  })
);

// @route POST /api/society-setup/buildings/:id/floors - "Add Floor" under a
// building: an empty floor placeholder, no flats on it yet.
router.post(
  '/buildings/:id/floors',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const building = await Building.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!building) return res.status(404).json({ message: 'Building not found' });

    const count = await Floor.count({ where: { buildingId: building.id } });
    const floor = await Floor.create({ society: req.societyId, buildingId: building.id, name: `Floor ${count + 1}` });
    res.status(201).json(floor);
  })
);

// @route PUT /api/society-setup/floors/:id { name } - "Rename". Cascades
// into every flat currently on this floor.
router.put(
  '/floors/:id',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const floor = await Floor.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!floor) return res.status(404).json({ message: 'Not found' });
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    await floor.update({ name });
    await Unit.update({ floor: name }, { where: { floorId: floor.id, society: req.societyId } });
    res.json(floor);
  })
);

// @route POST /api/society-setup/floors/:id/flats - "Add Flat" under a
// floor: one new flat, auto-named (renamed afterward via PUT below).
router.post(
  '/floors/:id/flats',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const floor = await Floor.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!floor) return res.status(404).json({ message: 'Floor not found' });
    const building = await Building.findOne({ where: { id: floor.buildingId, society: req.societyId } });

    const count = await Unit.count({ where: { floorId: floor.id } });
    const unit = await Unit.create({
      society: req.societyId,
      buildingId: floor.buildingId,
      floorId: floor.id,
      flatNo: `Flat ${count + 1}`,
      tower: building.name,
      floor: floor.name,
      type: 'Unspecified',
      areaSqft: 0,
      status: 'Vacant',
    });
    res.status(201).json(unit);
  })
);

// @route PUT /api/society-setup/flats/:id { flatNo } - "Rename" a flat.
router.put(
  '/flats/:id',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const unit = await Unit.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!unit) return res.status(404).json({ message: 'Not found' });
    const flatNo = (req.body.flatNo || '').trim();
    if (!flatNo) return res.status(400).json({ message: 'Flat No. is required.' });

    await unit.update({ flatNo });
    res.json(unit);
  })
);

// @route POST /api/society-setup/complete { secretaryFlatId } - final step:
// records which flat the Secretary lives in (their Membership gets
// flatId/flatNo/tower filled in), marks the society's setup as done, and
// re-syncs totalFlats/buildingsCount to the real counts. Re-issues a fresh
// token since the Secretary's flatId just changed (the old token still has
// flatId: null baked in).
router.post(
  '/complete',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const { secretaryFlatId } = req.body;
    if (!secretaryFlatId) {
      return res.status(400).json({ message: 'Please select which flat is yours before finishing.' });
    }

    const unit = await Unit.findOne({ where: { id: secretaryFlatId, society: req.societyId } });
    if (!unit) return res.status(404).json({ message: 'That flat could not be found.' });

    const membership = await Membership.findOne({ where: { user: req.user.id, society: req.societyId, role: 'secretary' } });
    if (!membership) return res.status(404).json({ message: 'Secretary membership not found.' });

    await membership.update({ flatNo: unit.flatNo, tower: unit.tower, flatId: `${unit.tower}-${unit.flatNo}` });

    const [buildingsCount, totalFlats] = await Promise.all([
      Building.count({ where: { society: req.societyId } }),
      Unit.count({ where: { society: req.societyId } }),
    ]);
    const society = await Society.findByPk(req.societyId);
    await society.update({ isSetupComplete: true, buildingsCount, totalFlats });

    const token = generateToken({ id: req.user.id, societyId: req.societyId, role: 'secretary', flatId: membership.flatId });
    res.json({ message: 'Society setup complete.', token, flatId: membership.flatId });
  })
);

module.exports = router;
