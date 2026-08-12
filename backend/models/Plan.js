const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Basic, Standard, Premium
    slug: { type: String, required: true, unique: true },
    pricePerFlatPerMonth: { type: Number, required: true },
    minFlats: { type: Number, default: 1 },
    maxFlats: { type: Number, default: 0 }, // 0 = unlimited
    features: [{ type: String }],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
