const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Dog', 'Cat', 'Bird', 'Fish', 'Other'], default: 'Dog' },
    breed: { type: String, default: '' },
    flatId: { type: String, required: true, index: true }, // spec-based flat identity (e.g. "G 610")
    vaccinated: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pet', petSchema);
