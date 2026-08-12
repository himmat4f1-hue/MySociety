const mongoose = require('mongoose');

// Owners are auto-added here (from FlatOwner) plus additional family members
// added by the flat's own Member. Visible only to: that flat's own members,
// Secretary, Chairman.
const familyMemberSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatId: { type: String, required: true, index: true },
    firstName: { type: String, required: true },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    birthDate: { type: Date, default: null },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    religion: { type: String, default: '' },
    mobileNumber: { type: String, default: '' },
    photo: { type: String, default: '' },
    isAutoAddedOwner: { type: Boolean, default: false }, // true for rows auto-created from FlatOwner
  },
  { timestamps: true }
);

module.exports = mongoose.model('FamilyMember', familyMemberSchema);
