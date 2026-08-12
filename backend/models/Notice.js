const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true }, // Finance, Maintenance, Community, Rules & Regulations, Amenities, Security, General
    building: { type: String, default: 'All Towers' },
    status: { type: String, enum: ['Published', 'Scheduled', 'Archived'], default: 'Published' },
    publishedOn: { type: Date, default: Date.now },
    scheduledDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
