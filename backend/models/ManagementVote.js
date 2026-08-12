const mongoose = require('mongoose');

// "Vote for Upper Management Role" election (Chairman/Secretary/Accountant/etc).
// Only Committee Members can vote, one vote per flat per role per election
// date. Same anonymity rule as CommitteeVote - only aggregate counts are ever
// exposed via the API.
const managementVoteSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    electionDate: { type: Date, required: true },
    role: { type: String, required: true }, // the role being elected for
    voterFlatId: { type: String, required: true }, // must belong to a committee member
    candidateFlatId: { type: String, required: true },
  },
  { timestamps: true }
);

managementVoteSchema.index({ society: 1, electionDate: 1, role: 1, voterFlatId: 1 }, { unique: true });

module.exports = mongoose.model('ManagementVote', managementVoteSchema);
