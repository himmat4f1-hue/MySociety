const mongoose = require('mongoose');

// Reference table: what an elected candidate is responsible for in each role.
const roleChecklistSchema = new mongoose.Schema(
  {
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    role: { type: String, required: true }, // Chairman, Secretary, Accountant, Treasurer, Committee Member, etc.
    responsibilities: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoleChecklist', roleChecklistSchema);
