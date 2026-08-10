const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true }, // Detergent, Gloves, Garbage Bags, etc.
    category: { type: String, enum: ['Cleaning', 'Safety', 'Equipment', 'Others'], default: 'Cleaning' },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'pcs' },
    status: { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'], default: 'In Stock' },
    requestedBy: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Supply', supplySchema);
