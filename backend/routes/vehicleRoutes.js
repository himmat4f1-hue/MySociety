const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');
const buildFlatPrivateController = require('../controllers/flatPrivateController');

const ctrl = buildFlatPrivateController(Vehicle, { searchFields: ['registrationNo', 'vehicleType', 'flatId'], ownFlatCanWrite: true });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, ctrl.createOne);
router.put('/:id', protect, ctrl.updateOne);
router.delete('/:id', protect, ctrl.deleteOne);

module.exports = router;
