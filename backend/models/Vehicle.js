const mongoose = require('mongoose');

// Visible only to: that flat's own members, Secretary, Chairman.
const vehicleSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatId: { type: String, required: true, index: true },
    vehicleType: { type: String, enum: ['Lauri', 'Truck', 'Bike', 'Scooter', 'Auto Rickshaw', 'Car', 'Tempo'], required: true },
    fuelType: { type: String, enum: ['CNG', 'Petrol', 'Electric'], default: 'Petrol' },
    color: { type: String, default: '' },
    registrationNo: { type: String, default: '' },
    photo: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
