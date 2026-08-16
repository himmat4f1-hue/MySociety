const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const AgendaItem = require('../models/AgendaItem');
const Meeting = require('../models/Meeting');
const MeetingAttendance = require('../models/MeetingAttendance');
const { protect, authorize } = require('../middleware/auth');
const buildCrudController = require('../controllers/genericController');
const { getQuorumSettings, ALL_MANAGEMENT } = require('../utils/quorum');

const ctrl = buildCrudController(AgendaItem, { searchFields: ['agenda'], populate: 'meeting' });

router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.post('/', protect, authorize('secretary'), ctrl.createOne);
router.put('/:id', protect, authorize('secretary'), ctrl.updateOne);
router.delete('/:id', protect, authorize('secretary'), ctrl.deleteOne);

// Casts a vote on this agenda's decision, choosing one of the item's
// voteOptions (e.g. "Approve" / "Reject/Cancel"). One vote per user - the
// voters list itself is never exposed via the API, only counts.
//
// Who can vote depends on the PARENT MEETING's type, not a fixed role list:
//   - General meeting  -> only General members (resident/tenant) may vote;
//     Management (secretary/chairman/treasurer/committee_member) may not.
//   - Committee meeting -> only Management may vote; General members may not.
// Voting is also blocked entirely until the relevant category's minimum
// attendance has been met for that meeting (mirrors the UI, which hides the
// Vote column until quorum is reached).
router.post(
  '/:id/vote',
  protect,
  asyncHandler(async (req, res) => {
    const item = await AgendaItem.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!item) return res.status(404).json({ message: 'Not found' });

    const meeting = await Meeting.findOne({ where: { id: item.meeting, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const isGeneral = meeting.type !== 'Committee';
    const allowedToVote = isGeneral ? ['resident', 'tenant'].includes(req.role) : ALL_MANAGEMENT.includes(req.role);
    if (!allowedToVote) {
      return res.status(403).json({
        message: isGeneral
          ? 'Only General members can vote in a General meeting.'
          : 'Only Management/Committee members can vote in a Committee meeting.',
      });
    }

    // Must have clicked "Add Me" for this agenda's meeting before voting -
    // matches the mockup where the Vote column stays "—" until Step 4.
    const joined = await MeetingAttendance.findOne({ where: { meeting: item.meeting, user: req.user.id } });
    if (!joined) {
      return res.status(403).json({ message: 'You must join this meeting (Add Me) before voting.' });
    }

    const [quorumSettings, attendanceRows] = await Promise.all([
      getQuorumSettings(req.societyId),
      MeetingAttendance.findAll({ where: { society: req.societyId, meeting: item.meeting } }),
    ]);
    const joinedCount = isGeneral
      ? attendanceRows.filter((a) => ['resident', 'tenant'].includes(a.role)).length
      : attendanceRows.filter((a) => ALL_MANAGEMENT.includes(a.role)).length;
    const requiredCount = isGeneral ? quorumSettings.minRequiredMembers : quorumSettings.minRequiredManagement;
    if (joinedCount < requiredCount) {
      return res.status(403).json({ message: 'Minimum required attendance has not been met yet for this meeting.' });
    }

    const now = new Date();
    if (item.votingStartAt && now < new Date(item.votingStartAt)) {
      return res.status(403).json({ message: 'Voting has not opened yet for this agenda item.' });
    }
    if (item.votingEndAt && now > new Date(item.votingEndAt)) {
      return res.status(403).json({ message: 'Voting has closed for this agenda item.' });
    }

    const { optionLabel } = req.body;
    const options = item.voteOptions && item.voteOptions.length ? item.voteOptions : [{ label: 'Approve', votes: 0 }, { label: 'Reject/Cancel', votes: 0 }];
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

// @route POST /api/agenda-items/:id/options - Secretary adds a custom vote
// option to this agenda item (the "Add Option" button replacing the old
// static "Options" column). The typed label just gets appended to
// voteOptions with votes:0, and immediately becomes selectable in every
// voter's dropdown alongside the default Approve / Reject-Cancel.
router.post(
  '/:id/options',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const item = await AgendaItem.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!item) return res.status(404).json({ message: 'Not found' });

    const label = (req.body.label || '').trim();
    if (!label) return res.status(400).json({ message: 'Option text is required.' });

    const options = item.voteOptions && item.voteOptions.length ? item.voteOptions : [{ label: 'Approve', votes: 0 }, { label: 'Reject/Cancel', votes: 0 }];
    if (options.some((o) => o.label.toLowerCase() === label.toLowerCase())) {
      return res.status(400).json({ message: 'This option already exists for this agenda item.' });
    }

    // New array (not a push onto the existing one) - see the note above on
    // JSONB change-detection for why this matters.
    const updatedOptions = [...options.map((o) => ({ ...o })), { label, votes: 0 }];
    await item.update({ voteOptions: updatedOptions });

    res.json({ voteOptions: updatedOptions });
  })
);

module.exports = router;
