const mongoose = require('mongoose');

// "Vote for Committee Member" election. One vote per FLAT (not per person) per
// election date. Raw records are never exposed via the API to anyone except
// admin (for audit) - everyone else only ever sees aggregated counts per
// candidate through the /results endpoint.
const committeeVoteSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    electionDate: { type: Date, required: true },
    voterFlatId: { type: String, required: true }, // the flat casting the vote
    candidateFlatId: { type: String, required: true }, // the flat/owner being voted for
  },
  { timestamps: true }
);

// One vote per flat per election date
committeeVoteSchema.index({ society: 1, electionDate: 1, voterFlatId: 1 }, { unique: true });

module.exports = mongoose.model('CommitteeVote', committeeVoteSchema);
