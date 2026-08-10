const mongoose = require('mongoose');

const cameraRequestSchema = new mongoose.Schema(
  {
    area: { type: String, required: true }, // Main Gate, Parking Area, Tower Entry, etc.
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    reason: { type: String, required: true },
    flatNo: { type: String, default: '' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'In Review', 'Completed'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CameraRequest', cameraRequestSchema);
