const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Overdue'], default: 'Open' },
    flatNo: { type: String, required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    raisedOn: { type: Date, default: Date.now },
    resolvedOn: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
