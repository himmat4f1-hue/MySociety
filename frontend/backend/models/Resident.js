const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: '' },
    flatNo: { type: String, required: true },
    tower: { type: String, required: true },
    type: { type: String, enum: ['Owner', 'Tenant'], default: 'Owner' },
    moveInDate: { type: Date, default: Date.now },
    familyMembers: [
      {
        name: String,
        relation: String,
        age: Number,
      },
    ],
    vehicles: [
      {
        type: { type: String },
        number: String,
      },
    ],
    emergencyContact: {
      name: String,
      phone: String,
    },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resident', residentSchema);
