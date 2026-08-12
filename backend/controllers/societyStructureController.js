const asyncHandler = require('../utils/asyncHandler');
const Building = require('../models/Building');
const Unit = require('../models/Unit');
const Society = require('../models/Society');

// This controller powers the Chairman-only "Society Structure" screen:
//   - Apartment societies: manage Buildings, and within each building, add or
//     remove Floors (each floor can have its own flat count - they don't have
//     to match across floors, or across buildings).
//   - Individual House societies: manage a flat list of standalone houses.
// Every add/remove here directly creates/deletes the real Unit (flat) records
// used throughout the rest of the app, so the whole system stays in sync.

const FLOOR_LABEL = (n) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} Floor`;

// @route GET /api/society-structure
const getStructure = asyncHandler(async (req, res) => {
  const society = await Society.findById(req.societyId);

  if (society.type === 'IndividualHouses') {
    const houses = await Unit.find({ society: req.societyId }).sort({ flatNo: 1 });
    return res.json({ type: 'IndividualHouses', houses });
  }

  const buildings = await Building.find({ society: req.societyId }).sort({ name: 1 });
  const units = await Unit.find({ society: req.societyId }).sort({ floor: 1, flatNo: 1 });

  const structure = buildings.map((b) => {
    const buildingUnits = units.filter((u) => u.tower === b.name);
    const floorsMap = {};
    buildingUnits.forEach((u) => {
      if (!floorsMap[u.floor]) floorsMap[u.floor] = [];
      floorsMap[u.floor].push(u);
    });
    const floors = Object.keys(floorsMap).map((floor) => ({
      floor,
      flatsCount: floorsMap[floor].length,
      units: floorsMap[floor],
    }));
    return { buildingId: b._id, name: b.name, floors };
  });

  res.json({ type: 'Apartment', buildings: structure });
});

// @route POST /api/society-structure/buildings   { name }
const addBuilding = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Building name is required' });

  const existing = await Building.findOne({ society: req.societyId, name });
  if (existing) return res.status(400).json({ message: 'A building with that name already exists' });

  const building = await Building.create({ society: req.societyId, name });
  res.status(201).json(building);
});

// @route DELETE /api/society-structure/buildings/:name
const removeBuilding = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const occupied = await Unit.countDocuments({ society: req.societyId, tower: name, status: { $ne: 'Vacant' } });
  if (occupied > 0) {
    return res.status(400).json({ message: `Cannot remove ${name} - it still has ${occupied} occupied/maintenance flat(s). Please vacate them first.` });
  }

  await Unit.deleteMany({ society: req.societyId, tower: name });
  await Building.deleteOne({ society: req.societyId, name });
  res.json({ message: `${name} and its flats have been removed` });
});

// @route POST /api/society-structure/buildings/:name/floors   { flatsCount, flatType, areaSqft }
const addFloor = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const { flatsCount, flatType, areaSqft } = req.body;

  const building = await Building.findOne({ society: req.societyId, name });
  if (!building) return res.status(404).json({ message: 'Building not found' });
  if (!flatsCount || Number(flatsCount) < 1) return res.status(400).json({ message: 'flatsCount must be at least 1' });

  const existingFloors = await Unit.distinct('floor', { society: req.societyId, tower: name });
  const nextFloorNumber = existingFloors.length + 1;
  const floorLabel = FLOOR_LABEL(nextFloorNumber);

  const docs = [];
  for (let i = 1; i <= Number(flatsCount); i++) {
    docs.push({
      society: req.societyId,
      tower: name,
      floor: floorLabel,
      flatNo: `${name}-${nextFloorNumber}0${i}`,
      type: flatType || '2 BHK',
      areaSqft: Number(areaSqft) || 1000,
      status: 'Vacant',
    });
  }
  const created = await Unit.insertMany(docs);
  res.status(201).json({ floor: floorLabel, units: created });
});

// @route DELETE /api/society-structure/buildings/:name/floors/:floor
const removeFloor = asyncHandler(async (req, res) => {
  const { name, floor } = req.params;
  const occupied = await Unit.countDocuments({ society: req.societyId, tower: name, floor, status: { $ne: 'Vacant' } });
  if (occupied > 0) {
    return res.status(400).json({ message: `Cannot remove this floor - it still has ${occupied} occupied/maintenance flat(s). Please vacate them first.` });
  }

  await Unit.deleteMany({ society: req.societyId, tower: name, floor });
  res.json({ message: 'Floor removed' });
});

// @route POST /api/society-structure/houses   { flatNo, type, areaSqft }
const addHouse = asyncHandler(async (req, res) => {
  const { flatNo, type, areaSqft } = req.body;
  if (!flatNo) return res.status(400).json({ message: 'House number/name is required' });

  const existing = await Unit.findOne({ society: req.societyId, flatNo });
  if (existing) return res.status(400).json({ message: 'A house with that number already exists' });

  const unit = await Unit.create({
    society: req.societyId,
    flatNo,
    tower: 'Individual Houses',
    floor: 'Ground',
    type: type || 'Independent House',
    areaSqft: Number(areaSqft) || 1200,
    status: 'Vacant',
  });
  res.status(201).json(unit);
});

// @route DELETE /api/society-structure/houses/:id
const removeHouse = asyncHandler(async (req, res) => {
  const unit = await Unit.findOne({ _id: req.params.id, society: req.societyId });
  if (!unit) return res.status(404).json({ message: 'House not found' });
  if (unit.status !== 'Vacant') {
    return res.status(400).json({ message: 'Cannot remove an occupied/maintenance house. Please vacate it first.' });
  }
  await Unit.deleteOne({ _id: unit._id });
  res.json({ message: 'House removed' });
});

module.exports = { getStructure, addBuilding, removeBuilding, addFloor, removeFloor, addHouse, removeHouse };
