const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const { protect } = require('../middleware/auth');
const buildFlatPrivateController = require('../controllers/flatPrivateController');

// Pet Data: visible only to that flat's own members, Secretary, Chairman, Admin.
const ctrl = buildFlatPrivateController(Pet, { searchFields: ['name', 'flatId', 'breed'], ownFlatCanWrite: true });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, ctrl.createOne);
router.put('/:id', protect, ctrl.updateOne);
router.delete('/:id', protect, ctrl.deleteOne);

module.exports = router;
