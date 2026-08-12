const express = require('express');
const router = express.Router();
const HomeService = require('../models/HomeService');
const { protect } = require('../middleware/auth');
const buildFlatPrivateController = require('../controllers/flatPrivateController');

const ctrl = buildFlatPrivateController(HomeService, { searchFields: ['firstName', 'lastName', 'type', 'flatId'], ownFlatCanWrite: true });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, ctrl.createOne);
router.put('/:id', protect, ctrl.updateOne);
router.delete('/:id', protect, ctrl.deleteOne);

module.exports = router;
