const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    invoiceNo: { type: String, required: true },
    flatNo: { type: String, required: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    residentName: String,
    description: { type: String, default: 'Maintenance Charges' },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
    paidOn: { type: Date, default: null },
  },
  { timestamps: true }
);

invoiceSchema.index({ society: 1, invoiceNo: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
