const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatNo: { type: String, required: true },
    tower: { type: String, required: true },
    floor: { type: String, required: true },
    type: { type: String, required: true }, // e.g. 2 BHK, 3 BHK
    areaSqft: { type: Number, required: true },
    status: { type: String, enum: ['Occupied', 'Vacant', 'Maintenance'], default: 'Vacant' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

unitSchema.index({ society: 1, flatNo: 1 }, { unique: true });

module.exports = mongoose.model('Unit', unitSchema);
