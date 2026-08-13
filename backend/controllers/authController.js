const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const Society = require('../models/Society');
const Plan = require('../models/Plan');
const Membership = require('../models/Membership');
const provisionUnits = require('../utils/provisionUnits');
const seedGuestSandbox = require('../utils/demoData');

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const makeUniqueSlug = async (base) => {
  let slug = slugify(base) || `society-${Date.now()}`;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Society.findOne({ where: { slug } })) {
    slug = `${slugify(base)}-${n}`;
    n++;
  }
  return slug;
};

const issueSessionResponse = async (user, membership) => {
  const society = await Society.findByPk(membership.society);
  const token = generateToken({ id: user.id, societyId: society.id, role: membership.role, flatId: membership.flatId || null });
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    role: membership.role,
    flatNo: membership.flatNo || null,
    tower: membership.tower || null,
    flatId: membership.flatId || null,
    avatar: user.avatar,
    society: { _id: society.id, name: society.name, slug: society.slug, isGuestSandbox: society.isGuestSandbox, expiresAt: society.expiresAt },
    token,
  };
};

// @desc  Step 1 of creating a brand-new society (used by the Plans & Offers "Get
// Started" flow). Creates the Society, auto-provisions its Units, and creates
// (or reuses) the requester's User account with a Chairman membership - there
// is no separate "admin" account; whoever sets up the society becomes its Chairman.
// @route POST /api/auth/register-society
const registerSociety = asyncHandler(async (req, res) => {
  const {
    societyName,
    city,
    societyType, // 'Apartment' | 'IndividualHouses'
    buildingsCount,
    flatsPerBuilding,
    housesCount,
    planSlug,
    adminName,
    adminEmail,
    adminPassword,
  } = req.body;

  const type = societyType === 'IndividualHouses' ? 'IndividualHouses' : 'Apartment';

  if (!societyName || !adminName || !adminEmail) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (type === 'Apartment' && (!buildingsCount || !flatsPerBuilding)) {
    return res.status(400).json({ message: 'buildingsCount and flatsPerBuilding are required for an Apartment society' });
  }
  if (type === 'IndividualHouses' && !housesCount) {
    return res.status(400).json({ message: 'housesCount is required for an Individual Houses society' });
  }

  const plan = planSlug ? await Plan.findOne({ where: { slug: planSlug } }) : null;
  const totalFlats = type === 'Apartment' ? Number(buildingsCount) * Number(flatsPerBuilding) : Number(housesCount);

  const slug = await makeUniqueSlug(societyName);
  const society = await Society.create({
    name: societyName,
    slug,
    city: city || '',
    type,
    buildingsCount: type === 'Apartment' ? Number(buildingsCount) : 0,
    totalFlats,
    plan: plan ? plan.id : null,
    status: 'Trial',
  });

  if (type === 'Apartment') {
    await provisionUnits(society.id, Number(buildingsCount), Number(flatsPerBuilding));
  } else {
    await provisionUnits.provisionHouses(society.id, Number(housesCount));
  }

  // Re-use the User account if this email already exists on the platform (multi-society support)
  let user = await User.findOne({ where: { email: String(adminEmail).toLowerCase().trim() } });
  if (!user) {
    if (!adminPassword) {
      return res.status(400).json({ message: 'Password is required to create a new account' });
    }
    user = await User.create({ name: adminName, email: adminEmail, password: adminPassword, role: 'chairman' });
  }

  const existingMembership = await Membership.findOne({ where: { user: user.id, society: society.id, role: 'chairman' } });
  if (existingMembership) {
    return res.status(400).json({ message: 'You are already the Chairman of this society' });
  }

  const membership = await Membership.create({ user: user.id, society: society.id, role: 'chairman' });

  const session = await issueSessionResponse(user, membership);
  res.status(201).json(session);
});

// @desc  Login resolver. Send { email, password } first. If the account has
// only one society/role/flat combination ("account"), logs straight in. If it
// has more than one, responds with the FULL list of every account up front
// (society name, role, flat) so the person can pick exactly which one to open
// - no multi-step drill-down. Re-call with { email, password, membershipId }
// using the id from the chosen option to complete login.
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, membershipId } = req.body;

  const user = await User.findOne({ where: { email: String(email || '').toLowerCase().trim() } });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const memberships = await Membership.findAll({ where: { user: user.id, status: 'active' } });
  if (memberships.length === 0) {
    return res.status(404).json({ message: 'This account is not linked to any society yet. Please register a society from the Plans & Offers page.' });
  }

  if (memberships.length === 1) {
    const session = await issueSessionResponse(user, memberships[0]);
    return res.json(session);
  }

  if (membershipId) {
    const chosen = memberships.find((m) => m.id === membershipId);
    if (!chosen) {
      return res.status(400).json({ message: 'That account selection is not valid for this login.' });
    }
    const session = await issueSessionResponse(user, chosen);
    return res.json(session);
  }

  // More than one account and none chosen yet - return the full list.
  const societyIds = [...new Set(memberships.map((m) => m.society))];
  const societies = await Society.findAll({ where: { id: societyIds } });
  const societyById = new Map(societies.map((s) => [s.id, s]));

  const options = memberships
    .map((m) => ({
      membershipId: m.id,
      societyId: m.society,
      societyName: societyById.get(m.society)?.name || 'Unknown Society',
      role: m.role,
      flatNo: m.flatNo || null,
      tower: m.tower || null,
      flatId: m.flatId || null,
    }))
    // group by society so the list reads naturally (all of society A's roles together, then society B's...)
    .sort((a, b) => a.societyName.localeCompare(b.societyName));

  res.json({ step: 'select', options });
});

// @desc  Switch the CURRENT logged-in session to a different account
// (society/role/flat) the same person also has, without re-entering a
// password. Powers the account switcher in the app (e.g. Topbar).
// @route POST /api/auth/switch
const switchAccount = asyncHandler(async (req, res) => {
  const { membershipId } = req.body;
  if (!membershipId) {
    return res.status(400).json({ message: 'membershipId is required' });
  }

  const membership = await Membership.findOne({ where: { id: membershipId, user: req.user.id, status: 'active' } });
  if (!membership) {
    return res.status(403).json({ message: 'You do not have access to that account.' });
  }

  const session = await issueSessionResponse(req.user, membership);
  res.json(session);
});

// Fixed demo OTP - no real SMS/telecom provider is configured in this build,
// so every request gets the same code and it's returned directly in the
// response instead of being texted. Swap this out for a real SMS provider
// (and store a per-request, expiring code) before using this in production.
const DEMO_OTP = '123456';

// Given a User row, returns EITHER { session } if they have exactly one
// active society/role/flat ("account"), or { options } listing every account
// they have (grouped-ready) if they have more than one. Shared by the OTP
// login flow below.
const resolveAccountsForUser = async (user) => {
  const memberships = await Membership.findAll({ where: { user: user.id, status: 'active' } });
  if (memberships.length === 0) {
    return { notFound: true };
  }
  if (memberships.length === 1) {
    return { session: await issueSessionResponse(user, memberships[0]) };
  }

  const societyIds = [...new Set(memberships.map((m) => m.society))];
  const societies = await Society.findAll({ where: { id: societyIds } });
  const societyById = new Map(societies.map((s) => [s.id, s]));

  const options = memberships
    .map((m) => ({
      membershipId: m.id,
      societyId: m.society,
      societyName: societyById.get(m.society)?.name || 'Unknown Society',
      role: m.role,
      flatNo: m.flatNo || null,
      tower: m.tower || null,
      flatId: m.flatId || null,
    }))
    .sort((a, b) => a.societyName.localeCompare(b.societyName));

  return { options };
};

// @desc  Step 1 of mobile login: send (in this demo, "send") an OTP to the
// given phone number. Only succeeds if a User account already exists with
// that phone number.
// @route POST /api/auth/request-otp
const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  const user = await User.findOne({ where: { phone: String(phone).trim() } });
  if (!user) {
    return res.status(404).json({ message: 'No account found for this mobile number.' });
  }

  // NOTE: demo mode - no SMS provider wired up, so the OTP is returned
  // directly in the response instead of being texted.
  res.json({ message: 'OTP sent.', demoOtp: DEMO_OTP });
});

// @desc  Step 2 of mobile login: verify the OTP, then either log straight in
// (single account) or return the full list of accounts to choose from
// (multiple accounts). Once an account is chosen, call this same endpoint
// again with { phone, otp, membershipId } to complete login.
// @route POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, membershipId } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required.' });
  }
  if (otp !== DEMO_OTP) {
    return res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
  }

  const user = await User.findOne({ where: { phone: String(phone).trim() } });
  if (!user) {
    return res.status(404).json({ message: 'No account found for this mobile number.' });
  }

  if (membershipId) {
    const membership = await Membership.findOne({ where: { id: membershipId, user: user.id, status: 'active' } });
    if (!membership) {
      return res.status(400).json({ message: 'That account selection is not valid.' });
    }
    return res.json(await issueSessionResponse(user, membership));
  }

  const result = await resolveAccountsForUser(user);
  if (result.notFound) {
    return res.status(404).json({ message: 'This account is not linked to any society yet. Please register a society from the Plans & Offers page.' });
  }
  if (result.session) {
    return res.json(result.session);
  }
  res.json({ step: 'select', options: result.options });
});

// @desc  Instantly creates a fresh, isolated guest sandbox society (pre-loaded with
// sample data) and logs the visitor straight in as its Chairman. Auto-expires after
// a few days (see utils/cleanupGuestSandboxes.js).
// @route POST /api/auth/guest
const guestLogin = asyncHandler(async (req, res) => {
  const stamp = Date.now();
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

  const society = await Society.create({
    name: `Guest Sandbox ${stamp}`,
    slug: `guest-sandbox-${stamp}`,
    isGuestSandbox: true,
    expiresAt,
    status: 'Trial',
    buildingsCount: 2,
    totalFlats: 20,
  });

  const user = await User.create({
    name: 'Guest User',
    email: `guest-${stamp}@sandbox.mysociety.local`,
    password: Math.random().toString(36).slice(2) + 'Aa1!',
    role: 'chairman',
  });

  const membership = await Membership.create({ user: user.id, society: society.id, role: 'chairman' });

  await seedGuestSandbox(society.id, user.id);

  const session = await issueSessionResponse(user, membership);
  res.status(201).json({ ...session, isGuest: true });
});

// @desc  Get logged-in user profile (based on the current token's society context)
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.role,
    flatId: req.flatId,
    avatar: req.user.avatar,
    society: { _id: req.society.id, name: req.society.name, slug: req.society.slug, isGuestSandbox: req.society.isGuestSandbox, expiresAt: req.society.expiresAt },
  });
});

// @desc  List all distinct society/role/flat combinations ("accounts") the
// current authenticated user has. Powers the account switcher in the UI.
// @route GET /api/auth/my-societies
const getMySocieties = asyncHandler(async (req, res) => {
  const memberships = await Membership.findAll({ where: { user: req.user.id, status: 'active' } });
  const societyIds = [...new Set(memberships.map((m) => m.society))];
  const societies = await Society.findAll({ where: { id: societyIds } });
  const societyById = new Map(societies.map((s) => [s.id, s]));

  const list = memberships
    .map((m) => ({
      membershipId: m.id,
      societyId: m.society,
      name: societyById.get(m.society)?.name || 'Unknown Society',
      slug: societyById.get(m.society)?.slug,
      role: m.role,
      flatNo: m.flatNo || null,
      tower: m.tower || null,
      flatId: m.flatId || null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(list);
});

// @desc  Step 1 of "forgot password": generate a 6-digit reset code.
// NOTE: no email service is wired up in this demo build, so the code is
// returned directly in the API response instead of being emailed. In a real
// deployment you would email this code and NOT return it in the response.
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email: String(email || '').toLowerCase().trim() } });
  if (!user) {
    return res.json({ message: 'If an account with that email exists, a reset code has been generated.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordCode = code;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  res.json({
    message: 'If an account with that email exists, a reset code has been generated.',
    demoResetCode: code,
  });
});

// @desc  Step 2 of "forgot password": verify code and set a new password.
// @route POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ where: { email: String(email || '').toLowerCase().trim() } });

  if (!user || user.resetPasswordCode !== code || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired reset code' });
  }

  user.password = newPassword;
  user.resetPasswordCode = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in with your new password.' });
});

module.exports = { registerSociety, loginUser, switchAccount, requestOtp, verifyOtp, guestLogin, getMe, getMySocieties, forgotPassword, resetPassword };
