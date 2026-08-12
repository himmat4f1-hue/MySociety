const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true }, // Governance, Finance, Maintenance, Safety, Amenities, Legal, General
    type: { type: String, default: 'File' }, // Folder, PDF, Excel, Word, Image, PPT
    building: { type: String, default: 'All Towers' },
    fileUrl: { type: String, default: '' },
    sizeKB: { type: Number, default: 0 },
    isFolder: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
