const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const AgendaItem = require('../models/AgendaItem');
const { protect, authorize } = require('../middleware/auth');
const buildCrudController = require('../controllers/genericController');

const ctrl = buildCrudController(AgendaItem, { searchFields: ['agenda'], populate: 'meeting' });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, authorize('secretary'), ctrl.createOne);
router.put('/:id', protect, authorize('secretary'), ctrl.updateOne);
router.delete('/:id', protect, authorize('secretary'), ctrl.deleteOne);

// Management-level members cast a vote on this agenda's decision. One vote per
// user - the voters list itself is never exposed via the API, only the count.
router.post(
  '/:id/vote',
  protect,
  authorize('secretary', 'chairman', 'treasurer', 'committee_member'),
  asyncHandler(async (req, res) => {
    const item = await AgendaItem.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!item) return res.status(404).json({ message: 'Not found' });

    const voters = item.voters || [];
    if (voters.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already voted on this agenda item' });
    }

    const updatedVoters = [...voters, req.user.id];
    await item.update({ voters: updatedVoters, noOfVotes: updatedVoters.length });

    res.json({ noOfVotes: item.noOfVotes });
  })
);

module.exports = router;
