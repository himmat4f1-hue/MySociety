const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    staffName: { type: String, required: true },
    role: { type: String, enum: ['Security', 'Housekeeping'], required: true },
    shiftType: { type: String, enum: ['Morning', 'Evening', 'Night'], required: true },
    date: { type: Date, default: Date.now },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    status: { type: String, enum: ['Scheduled', 'Present', 'Absent', 'On Leave'], default: 'Scheduled' },
    handoverNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);
