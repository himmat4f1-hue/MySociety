const express = require('express');
const Complaint = require('../models/Complaint');
const buildCrudController = require('../controllers/genericController');
const { protect } = require('../middleware/auth');
const { autoFillUser } = require('../middleware/autoFillUser');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../utils/auditLog');

const router = express.Router();
router.use(...autoFillUser('raisedBy'));

const ctrl = buildCrudController(Complaint, { searchFields: ['title', 'flatNo', 'category'], populate: 'raisedBy' });

// Shared board - everyone can see every complaint/request, and anyone can
// raise a new one (auto-filled with their own user id as raisedBy above).
router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, ctrl.createOne);

// @route PUT /api/complaints/:id
// Once raised, a complaint/request's original details (title, description,
// category, flatNo, priority...) are locked forever - not even the person
// who raised it can edit them (see DELETE below for their only option).
// Only the Secretary can touch it afterwards, and even then ONLY to fill in
// Response / Closing Date / Status - any other field in the request body is
// silently ignored, not just Priority/description "read replaced".
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    if (req.role !== 'secretary') {
      return res.status(403).json({ message: 'Only the Secretary can update a complaint/request after it has been raised.' });
    }
    const complaint = await Complaint.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!complaint) return res.status(404).json({ message: 'Not found' });

    const allowed = ['response', 'resolvedOn', 'status'];
    const payload = {};
    for (const key of allowed) {
      if (key in req.body) payload[key] = req.body[key];
    }

    await complaint.update(payload);
    logActivity(req, { action: 'Update', resourceType: 'Complaint', resourceId: complaint.id, details: { changed: Object.keys(payload) } });
    res.json(complaint);
  })
);

// @route DELETE /api/complaints/:id - only the person who raised it can
// delete it - their only available action once it's been booked.
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const complaint = await Complaint.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    if (complaint.raisedBy !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete a complaint/request you raised yourself.' });
    }
    await complaint.destroy();
    logActivity(req, { action: 'Delete', resourceType: 'Complaint', resourceId: req.params.id });
    res.json({ message: 'Deleted successfully' });
  })
);

module.exports = router;
