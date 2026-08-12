const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    residentName: String,
    date: { type: Date, default: Date.now },
    fromTime: String,
    toTime: String,
    status: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Confirmed' },
  },
  { _id: true }
);

const amenitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // Fitness, Recreation, Community, Sports, Entertainment, Utility
    building: { type: String, default: 'All Towers' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Available', 'Under Maintenance', 'Out of Service'], default: 'Available' },
    availability: { type: String, default: '' }, // e.g. "6:00 AM - 10:00 PM"
    bookings: [bookingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Amenity', amenitySchema);
