const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Visitor Management Policy, Parking Policy, etc.
    version: { type: String, default: '1.0' },
    fileUrl: { type: String, default: '' },
    publishedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
