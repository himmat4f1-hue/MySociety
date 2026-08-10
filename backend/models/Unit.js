const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    flatNo: { type: String, required: true, unique: true },
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

module.exports = mongoose.model('Unit', unitSchema);
