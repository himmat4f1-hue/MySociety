const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Medical', 'Security', 'Fire/Safety', 'Other'], required: true },
    flatNo: { type: String, default: '' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Resolved'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Emergency', emergencySchema);
