const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['admin', 'security', 'resident', 'accountant', 'secretary', 'chairman', 'treasurer', 'committee_member', 'tenant', 'housekeeping'],
      default: 'resident',
    },
    residentType: { type: String, enum: ['owner', 'tenant', null], default: null },
    flatNo: { type: String, default: null },
    tower: { type: String, default: null },
    avatar: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
