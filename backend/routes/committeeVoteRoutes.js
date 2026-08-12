const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const CommitteeVote = require('../models/CommitteeVote');
const { protect, authorize } = require('../middleware/auth');

// Cast a vote: one per flat per election date. voterFlatId is always forced to
// the caller's own flat - nobody can vote on behalf of another flat, and the
// individual vote is never exposed back through any read endpoint below.
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    if (!req.flatId) return res.status(403).json({ message: 'Your account is not linked to a flat' });
    const { electionDate, candidateFlatId } = req.body;
    if (!electionDate || !candidateFlatId) {
      return res.status(400).json({ message: 'electionDate and candidateFlatId are required' });
    }

    try {
      await CommitteeVote.create({
        society: req.societyId,
        electionDate,
        voterFlatId: req.flatId,
        candidateFlatId,
      });
      res.status(201).json({ message: 'Your vote has been recorded' });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Your flat has already voted in this election' });
      }
      throw err;
    }
  })
);

// Has my flat already voted in this election? (lets the UI hide the ballot after voting,
// without ever revealing who anyone voted for)
router.get(
  '/my-status',
  protect,
  asyncHandler(async (req, res) => {
    const { electionDate } = req.query;
    const voted = await CommitteeVote.exists({ society: req.societyId, electionDate, voterFlatId: req.flatId });
    res.json({ hasVoted: !!voted });
  })
);

// Aggregate results only - visible to Secretary/Chairman/Admin. Never returns
// which flat voted for whom.
router.get(
  '/results',
  protect,
  authorize('secretary', 'chairman'),
  asyncHandler(async (req, res) => {
    const { electionDate } = req.query;
    const match = { society: req.societyId };
    if (electionDate) match.electionDate = new Date(electionDate);

    const results = await CommitteeVote.aggregate([
      { $match: match },
      { $group: { _id: '$candidateFlatId', votes: { $sum: 1 } } },
      { $sort: { votes: -1 } },
      { $project: { _id: 0, candidateFlatId: '$_id', votes: 1 } },
    ]);

    const totalVotes = results.reduce((s, r) => s + r.votes, 0);
    res.json({ results, totalVotes });
  })
);

module.exports = router;
