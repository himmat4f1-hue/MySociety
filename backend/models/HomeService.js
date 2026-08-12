const mongoose = require('mongoose');

// Domestic staff / recurring home-service providers for a flat (housekeeping,
// school van, house maid, etc). Visible only to: that flat's own members,
// Secretary, Chairman.
const homeServiceSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatId: { type: String, required: true, index: true },
    type: { type: String, enum: ['Personal Housekeeping', 'School Van', 'House Maid', 'Milk Supplier', 'News Paper Supplier', 'Other'], required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    religion: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    photo: { type: String, default: '' },
    inTime: { type: String, default: '' },
    outTime: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeService', homeServiceSchema);
