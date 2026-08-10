const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
    votesYes: { type: Number, default: 0 },
    votesNo: { type: Number, default: 0 },
    totalEligible: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Poll', pollSchema);
