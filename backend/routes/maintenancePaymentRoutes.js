const express = require('express');
const router = express.Router();
const MaintenancePayment = require('../models/MaintenancePayment');
const { protect } = require('../middleware/auth');
const buildFlatPrivateController = require('../controllers/flatPrivateController');

// Maintenance Payments: visible to that flat's own members plus Secretary/
// Chairman (same visibility rule as FamilyMember/Pet), but write-restricted
// to the Secretary only (ownFlatCanWrite: false) - a resident/tenant can
// see what's been recorded against their flat, not record it themselves.
const ctrl = buildFlatPrivateController(MaintenancePayment, { searchFields: ['flatId', 'notes'], ownFlatCanWrite: false });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, ctrl.createOne);
router.put('/:id', protect, ctrl.updateOne);
router.delete('/:id', protect, ctrl.deleteOne);

module.exports = router;
