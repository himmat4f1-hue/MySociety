const express = require('express');
const RoleChecklist = require('../models/RoleChecklist');
const makeCrudRouter = require('../utils/makeCrudRouter');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/role-checklists/by-role/:role - fetch (or auto-create, if
// it doesn't exist yet) the checklist for one role. Registered BEFORE the
// generic /:id routes for the same reason as other /by-x patterns in this app.
router.get(
  '/by-role/:role',
  protect,
  asyncHandler(async (req, res) => {
    const [row] = await RoleChecklist.findOrCreate({
      where: { society: req.societyId, role: req.params.role },
      defaults: { society: req.societyId, role: req.params.role, items: [] },
    });
    res.json(row);
  })
);

// @route POST /api/role-checklists/by-role/:role/items   { text }
router.post(
  '/by-role/:role/items',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const [row] = await RoleChecklist.findOrCreate({
      where: { society: req.societyId, role: req.params.role },
      defaults: { society: req.societyId, role: req.params.role, items: [] },
    });
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Task text is required.' });
    const newItem = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, done: false };
    await row.update({ items: [...row.items, newItem] });
    res.json(row);
  })
);

// @route PATCH /api/role-checklists/by-role/:role/items/:itemId   { done }
router.patch(
  '/by-role/:role/items/:itemId',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const row = await RoleChecklist.findOne({ where: { society: req.societyId, role: req.params.role } });
    if (!row) return res.status(404).json({ message: 'Checklist not found' });
    const items = row.items.map((it) => (it.id === req.params.itemId ? { ...it, done: !!req.body.done } : { ...it }));
    await row.update({ items });
    res.json(row);
  })
);

// @route DELETE /api/role-checklists/by-role/:role/items/:itemId
router.delete(
  '/by-role/:role/items/:itemId',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const row = await RoleChecklist.findOne({ where: { society: req.societyId, role: req.params.role } });
    if (!row) return res.status(404).json({ message: 'Checklist not found' });
    await row.update({ items: row.items.filter((it) => it.id !== req.params.itemId) });
    res.json(row);
  })
);

router.use('/', makeCrudRouter(RoleChecklist, { searchFields: ['role'] }, { read: 'any', write: ['secretary'] }));

module.exports = router;
