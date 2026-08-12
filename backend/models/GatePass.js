const mongoose = require('mongoose');

const gatePassSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    type: { type: String, enum: ['Visitor', 'Vendor', 'Vehicle', 'Service Staff'], required: true },
    name: { type: String, required: true },
    mobile: { type: String, default: '' },
    flatNo: { type: String, required: true },
    vehicleNumber: { type: String, default: '' },
    validFrom: { type: Date, default: Date.now },
    validTill: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Expired', 'Revoked'], default: 'Active' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GatePass', gatePassSchema);
