const express = require('express');
const router = express.Router();
const FamilyMember = require('../models/FamilyMember');
const { protect } = require('../middleware/auth');
const buildFlatPrivateController = require('../controllers/flatPrivateController');

// FamilyMember ("Family Data"): the flat's own member can add/edit/delete
// (except the auto-added owner row, which is managed via FlatOwner instead).
const ctrl = buildFlatPrivateController(FamilyMember, { searchFields: ['firstName', 'lastName', 'flatId'], ownFlatCanWrite: true });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, ctrl.createOne);
router.put('/:id', protect, ctrl.updateOne);
router.delete('/:id', protect, ctrl.deleteOne);

module.exports = router;
