const mongoose = require('mongoose');

// Links a User to a Society with a role scoped to that society. A single user
// (same email) can now have MULTIPLE memberships within the SAME society -
// e.g. someone who is both an Owner (of one or more flats) AND the Secretary
// of the same society. This is why there is no longer a unique(user, society)
// constraint - instead each (user, society, role, flatId) combination is its
// own row, and the login flow lets the person pick which "hat" they're
// wearing (role) and, if relevant, which flat, each time they log in.
const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    role: {
      type: String,
      enum: ['security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant', 'housekeeping'],
      required: true,
    },
    flatNo: { type: String, default: null },
    tower: { type: String, default: null },
    flatId: { type: String, default: null, index: true }, // e.g. "A-101" - only meaningful for owner/tenant-type roles
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// A given role can only be granted once per flat per user (prevents duplicate
// rows), but the same user CAN have several rows in the same society - one
// per role, and (for resident/tenant) one per flat within that role.
membershipSchema.index({ user: 1, society: 1, role: 1, flatId: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);
