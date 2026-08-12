const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const ManagementVote = require('../models/ManagementVote');
const { protect, authorize } = require('../middleware/auth');

// Only Committee Members can vote here. voterFlatId is forced to the caller's
// own flat and never exposed back through any read endpoint.
router.post(
  '/',
  protect,
  authorize('committee_member'),
  asyncHandler(async (req, res) => {
    if (!req.flatId) return res.status(403).json({ message: 'Your account is not linked to a flat' });
    const { electionDate, role, candidateFlatId } = req.body;
    if (!electionDate || !role || !candidateFlatId) {
      return res.status(400).json({ message: 'electionDate, role and candidateFlatId are required' });
    }

    try {
      await ManagementVote.create({
        society: req.societyId,
        electionDate,
        role,
        voterFlatId: req.flatId,
        candidateFlatId,
      });
      res.status(201).json({ message: 'Your vote has been recorded' });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Your flat has already voted for this role in this election' });
      }
      throw err;
    }
  })
);

router.get(
  '/my-status',
  protect,
  authorize('committee_member'),
  asyncHandler(async (req, res) => {
    const { electionDate, role } = req.query;
    const voted = await ManagementVote.exists({ society: req.societyId, electionDate, role, voterFlatId: req.flatId });
    res.json({ hasVoted: !!voted });
  })
);

// Aggregate results only - visible to Secretary/Chairman/Admin.
router.get(
  '/results',
  protect,
  authorize('secretary', 'chairman'),
  asyncHandler(async (req, res) => {
    const { electionDate, role } = req.query;
    const match = { society: req.societyId };
    if (electionDate) match.electionDate = new Date(electionDate);
    if (role) match.role = role;

    const results = await ManagementVote.aggregate([
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
