const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const buildCrudController = require('../controllers/genericController');

const ctrl = buildCrudController(User, { searchFields: ['name', 'email', 'flatNo'] });

// All authenticated users can view the directory (needed for resident lists etc.)
router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
// Only admin can create/update/delete user accounts directly (registration handled via /auth/register too)
router.post('/', protect, authorize('admin', 'secretary'), ctrl.createOne);
router.put('/:id', protect, authorize('admin', 'secretary'), ctrl.updateOne);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteOne);

module.exports = router;
