const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const AgendaItem = require('../models/AgendaItem');
const MeetingAttendance = require('../models/MeetingAttendance');
const { protect, authorize } = require('../middleware/auth');
const buildCrudController = require('../controllers/genericController');

const ctrl = buildCrudController(AgendaItem, { searchFields: ['agenda'], populate: 'meeting' });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, authorize('secretary'), ctrl.createOne);
router.put('/:id', protect, authorize('secretary'), ctrl.updateOne);
router.delete('/:id', protect, authorize('secretary'), ctrl.deleteOne);

// Management-level members cast a vote on this agenda's decision, choosing
// one of the item's voteOptions (e.g. "Approve" / "Reject"). One vote per
// user - the voters list itself is never exposed via the API, only counts.
// Enforces the voting window (votingStartAt/votingEndAt) set by the
// Secretary when the agenda item was created - votes outside that window
// are rejected, not just hidden in the UI.
router.post(
  '/:id/vote',
  protect,
  authorize('secretary', 'chairman', 'treasurer', 'committee_member'),
  asyncHandler(async (req, res) => {
    const item = await AgendaItem.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!item) return res.status(404).json({ message: 'Not found' });

    // Must have clicked "Add Me" for this agenda's meeting before voting -
    // matches the mockup where the Vote column stays "—" until Step 4.
    const joined = await MeetingAttendance.findOne({ where: { meeting: item.meeting, user: req.user.id } });
    if (!joined) {
      return res.status(403).json({ message: 'You must join this meeting (Add Me) before voting.' });
    }

    const now = new Date();
    if (item.votingStartAt && now < new Date(item.votingStartAt)) {
      return res.status(403).json({ message: 'Voting has not opened yet for this agenda item.' });
    }
    if (item.votingEndAt && now > new Date(item.votingEndAt)) {
      return res.status(403).json({ message: 'Voting has closed for this agenda item.' });
    }

    const { optionLabel } = req.body;
    const options = item.voteOptions && item.voteOptions.length ? item.voteOptions : [{ label: 'Approve', votes: 0 }, { label: 'Reject', votes: 0 }];
    const chosen = options.find((o) => o.label === optionLabel);
    if (!chosen) {
      return res.status(400).json({ message: `optionLabel must be one of: ${options.map((o) => o.label).join(', ')}` });
    }

    const voters = item.voters || [];
    if (voters.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already voted on this agenda item' });
    }

    // Build a BRAND NEW array (never mutate options/chosen in place) - if we
    // pass Sequelize the same array reference it already holds internally,
    // it can't tell the JSONB value changed and silently skips writing it,
    // even though other fields in the same .update() call do get saved.
    // This was a real bug: noOfVotes was persisting correctly but the
    // per-option vote counts (voteOptions) never were.
    const updatedOptions = options.map((o) => (o.label === optionLabel ? { ...o, votes: (o.votes || 0) + 1 } : { ...o }));

    const updatedVoters = [...voters, req.user.id];
    await item.update({ voters: updatedVoters, noOfVotes: updatedVoters.length, voteOptions: updatedOptions });

    res.json({ noOfVotes: updatedVoters.length, voteOptions: updatedOptions });
  })
);

module.exports = router;
