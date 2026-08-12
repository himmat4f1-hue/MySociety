const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    kind: { type: String, enum: ['Investment', 'Asset'], default: 'Investment' },
    name: { type: String, required: true }, // Fixed Deposit - HDFC, Mutual Fund - SBI, etc.
    amount: { type: Number, required: true },
    maturityDate: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
