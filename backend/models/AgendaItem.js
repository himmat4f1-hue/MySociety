const mongoose = require('mongoose');

// A Meeting can have several agenda items - each with its own priority,
// decision, status, vote count, and estimated implementation timeline.
const agendaItemSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    agenda: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    managementDecision: { type: String, default: '' }, // free text - Secretary defines the options per-agenda, not a fixed global list
    agendaStatus: { type: String, enum: ['Not Started', 'In Discussion', 'Postponed', 'Resolved', 'Rejected'], default: 'Not Started' },
    noOfVotes: { type: Number, default: 0 }, // count of management-level votes cast on this decision
    voters: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [], select: false }, // internal dedup list - never exposed via API
    estimatedStartDate: { type: Date, default: null }, // when the decided action is expected to start
    estimatedEndDate: { type: Date, default: null }, // when the decided action is expected to finish
  },
  { timestamps: true }
);

module.exports = mongoose.model('AgendaItem', agendaItemSchema);
