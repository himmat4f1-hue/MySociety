const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const Society = require('../models/Society');
const Plan = require('../models/Plan');
const Membership = require('../models/Membership');
const provisionUnits = require('../utils/provisionUnits');
const seedGuestSandbox = require('../utils/demoData');

const FLAT_ROLES = ['resident', 'tenant'];

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

// @desc  Progressive login resolver. Send { email, password } first; the
// response tells you the next thing to ask the person to pick (society, then
// role, then flat - only the steps that are actually ambiguous are returned).
// Re-call this same endpoint including whatever has been picked so far
// (societyId, role, flatId) until the response contains a "token" instead of
// a "step" - that means login is complete.
//   1) email+password only            -> may ask to pick a SOCIETY
//   2) + societyId                     -> may ask to pick a ROLE (e.g. Owner vs Secretary)
//   3) + role (if resident/tenant)     -> may ask to pick a FLAT (if they have more than one)
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, societyId, role, flatId } = req.body;

  const user = await User.findOne({ where: { email: String(email || '').toLowerCase().trim() } });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  let memberships = await Membership.findAll({ where: { user: user.id, status: 'active' } });
  if (memberships.length === 0) {
    return res.status(404).json({ message: 'This account is not linked to any society yet. Please register a society from the Plans & Offers page.' });
  }

  const societyIds = [...new Set(memberships.map((m) => m.society))];
  const societies = await Society.findAll({ where: { id: societyIds } });
  const societyById = new Map(societies.map((s) => [s.id, s]));

  // Step 1: narrow down to a single Society
  if (societyId) {
    memberships = memberships.filter((m) => m.society === societyId);
  }
  const distinctSocietyIds = [...new Set(memberships.map((m) => m.society))];
  if (distinctSocietyIds.length === 0) {
    return res.status(404).json({ message: 'No matching society membership found.' });
  }
  if (distinctSocietyIds.length > 1) {
    return res.json({
      step: 'society',
      options: distinctSocietyIds.map((sid) => ({ societyId: sid, name: societyById.get(sid)?.name, slug: societyById.get(sid)?.slug })),
    });
  }
  const chosenSociety = societyById.get(distinctSocietyIds[0]);

  // Step 2: narrow down to a single Role within that society
  if (role) {
    memberships = memberships.filter((m) => m.role === role);
  }
  const distinctRoles = [...new Set(memberships.map((m) => m.role))];
  if (distinctRoles.length === 0) {
    return res.status(404).json({ message: 'No matching role found for that selection.' });
  }
  if (distinctRoles.length > 1) {
    return res.json({
      step: 'role',
      societyId: chosenSociety.id,
      societyName: chosenSociety.name,
      options: distinctRoles.map((r) => ({ role: r })),
    });
  }
  const chosenRole = distinctRoles[0];

  // Step 3: narrow down to a single Flat - only relevant for owner/tenant roles
  if (FLAT_ROLES.includes(chosenRole)) {
    if (flatId) {
      memberships = memberships.filter((m) => m.flatId === flatId);
    }
    const distinctFlats = [...new Set(memberships.map((m) => m.flatId).filter(Boolean))];
    if (distinctFlats.length > 1) {
      return res.json({
        step: 'flat',
        societyId: chosenSociety.id,
        societyName: chosenSociety.name,
        role: chosenRole,
        options: distinctFlats.map((f) => ({ flatId: f })),
      });
    }
  }

  // Fully resolved - issue the token
  const session = await issueSessionResponse(user, memberships[0]);
  res.json(session);
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

// @desc  List all distinct society/role/flat combinations the current
// authenticated user has. Powers a "switch account" option in the UI.
// @route GET /api/auth/my-societies
const getMySocieties = asyncHandler(async (req, res) => {
  const memberships = await Membership.findAll({ where: { user: req.user.id, status: 'active' } });
  const societyIds = [...new Set(memberships.map((m) => m.society))];
  const societies = await Society.findAll({ where: { id: societyIds } });
  const societyById = new Map(societies.map((s) => [s.id, s]));

  res.json(
    memberships.map((m) => ({
      societyId: m.society,
      name: societyById.get(m.society)?.name,
      slug: societyById.get(m.society)?.slug,
      role: m.role,
      flatId: m.flatId,
    }))
  );
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

module.exports = { registerSociety, loginUser, guestLogin, getMe, getMySocieties, forgotPassword, resetPassword };
