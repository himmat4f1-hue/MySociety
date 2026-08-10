const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, default: 'General' }, // General, Committee, Internal
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    location: { type: String, default: '' },
    agenda: { type: String, default: '' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', meetingSchema);
