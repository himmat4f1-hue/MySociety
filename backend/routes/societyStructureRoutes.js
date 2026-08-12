const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStructure,
  addBuilding,
  removeBuilding,
  addFloor,
  removeFloor,
  addHouse,
  removeHouse,
} = require('../controllers/societyStructureController');

// Viewing the structure is useful for everyone (e.g. Secretary needs it too
// when registering a new flat owner), but adding/removing buildings, floors
// or houses is a Chairman-only right, per the society's governance rules.
router.get('/', protect, getStructure);

router.post('/buildings', protect, authorize('chairman'), addBuilding);
router.delete('/buildings/:name', protect, authorize('chairman'), removeBuilding);
router.post('/buildings/:name/floors', protect, authorize('chairman'), addFloor);
router.delete('/buildings/:name/floors/:floor', protect, authorize('chairman'), removeFloor);

router.post('/houses', protect, authorize('chairman'), addHouse);
router.delete('/houses/:id', protect, authorize('chairman'), removeHouse);

module.exports = router;
