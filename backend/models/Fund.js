const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    type: { type: String, enum: ['Required', 'Celebration'], required: true },
    title: { type: String, required: true }, // Lift Modernization Project, Diwali Celebration 2024
    targetAmount: { type: Number, default: 0 },
    collectedAmount: { type: Number, default: 0 },
    expenseAmount: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fund', fundSchema);
