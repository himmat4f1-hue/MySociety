const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Housekeeping', 'Lift', 'Camera', 'Electrical', 'Plumbing', 'Other'], required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Process', 'Resolved'], default: 'Open' },
    flatId: { type: String, default: null }, // new spec-based flat identity (e.g. "G 610")
    flatNo: { type: String, required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    raisedOn: { type: Date, default: Date.now },
    resolvedOn: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
