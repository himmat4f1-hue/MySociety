const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc  Register new user (admin only realistically, but open here for demo/seed convenience)
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, flatNo, tower, residentType } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'resident',
    phone,
    flatNo,
    tower,
    residentType,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    flatNo: user.flatNo,
    tower: user.tower,
    token: generateToken(user._id),
  });
});

// @desc  Login user
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.status === 'inactive') {
    return res.status(403).json({ message: 'Your account is inactive. Contact society admin.' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    flatNo: user.flatNo,
    tower: user.tower,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @desc  Get logged-in user profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, getMe };
