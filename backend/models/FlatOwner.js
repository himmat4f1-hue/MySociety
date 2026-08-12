const mongoose = require('mongoose');

// "Personal Data" table from the spec. One row per registered owner on a flat
// (a flat can have more than one owner - see ownerNo). Only Secretary can
// add/edit/delete. Visible only to: that flat's own members, Secretary, Chairman.
const flatOwnerSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatId: { type: String, required: true, index: true }, // e.g. "G 610" - building + flat no combined, shared by co-owners
    building: { type: String, required: true },
    flatNo: { type: String, required: true },
    ownerNo: { type: Number, required: true }, // 1, 2, 3... distinguishes co-owners on the same flat
    firstName: { type: String, required: true },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    birthDate: { type: Date, default: null },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    religion: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // linked login account, if any
  },
  { timestamps: true }
);

flatOwnerSchema.index({ society: 1, flatId: 1, ownerNo: 1 }, { unique: true });

module.exports = mongoose.model('FlatOwner', flatOwnerSchema);
