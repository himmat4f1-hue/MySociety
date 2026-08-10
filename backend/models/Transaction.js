const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Income', 'Expense'], required: true },
    category: { type: String, required: true }, // Maintenance, Utilities, Salaries, Admin, Others / Collection
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    flatNo: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Collected', 'Paid', 'Pending'], default: 'Collected' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
