const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema(
  {
    flatNo: { type: String, required: true },
    tower: { type: String, default: '' },
    tenantName: { type: String, required: true },
    ownerName: { type: String, default: '' },
    leaseStart: { type: Date, required: true },
    leaseEnd: { type: Date, required: true },
    monthlyRent: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Expiring Soon', 'Expired', 'Renewed'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lease', leaseSchema);
