const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    purpose: { type: String, required: true },
    flatNo: { type: String, required: true },
    residentName: { type: String },
    inTime: { type: Date, default: Date.now },
    outTime: { type: Date, default: null },
    status: { type: String, enum: ['Inside', 'Checked Out', 'Pre-Approved'], default: 'Inside' },
    photo: { type: String, default: '' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);
