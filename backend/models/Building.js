const mongoose = require('mongoose');

// A named building/tower within an "Apartment"-type society. Floors and flats
// inside it are represented directly as Unit documents (tower = this
// building's name) - this model just tracks the building's existence/name so
// a building can exist even before any floors/flats have been added to it.
const buildingSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

buildingSchema.index({ society: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Building', buildingSchema);
