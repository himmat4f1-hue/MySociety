const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const Membership = require('../models/Membership');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// User accounts are GLOBAL (one email = one account across the whole platform),
// but which users belong to the CURRENT society is determined by Membership.
// So instead of querying the User table directly (which has no societyId
// and would either leak data across societies or return nothing), we query
// Memberships scoped to req.societyId and join in the user's basic info.

// @route GET /api/users  (directory of everyone in the current society)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 20 } = req.query;

    const memberships = await Membership.findAll({ where: { society: req.societyId, status: 'active' } });
    const userIds = [...new Set(memberships.map((m) => m.user))];
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds }, status: 'active' },
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'status'],
    });
    const userById = new Map(users.map((u) => [u.id, u.toJSON()]));

    let members = memberships
      .filter((m) => userById.has(m.user))
      .map((m) => {
        const u = userById.get(m.user);
        return {
          _id: u.id,
          membershipId: m.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar,
          status: u.status,
          role: m.role,
          flatNo: m.flatNo,
          tower: m.tower,
        };
      });

    if (search) {
      const re = new RegExp(search, 'i');
      members = members.filter((m) => re.test(m.name) || re.test(m.email) || re.test(m.flatNo || ''));
    }

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.max(parseInt(limit) || 20, 1);
    const total = members.length;
    const data = members.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({ data, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  })
);

// @route POST /api/users  (invite/create a new member into the CURRENT society)
router.post(
  '/',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, flatNo, tower } = req.body;

    let user = await User.findOne({ where: { email: String(email || '').toLowerCase().trim() } });
    if (!user) {
      user = await User.create({ name, email, password: password || Math.random().toString(36).slice(2), role, phone, flatNo, tower });
    }

    const existing = await Membership.findOne({ where: { user: user.id, society: req.societyId } });
    if (existing) {
      return res.status(400).json({ message: 'This person is already a member of your society' });
    }

    const membership = await Membership.create({ user: user.id, society: req.societyId, role, flatNo, tower });
    res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: membership.role, flatNo: membership.flatNo, tower: membership.tower });
  })
);

// @route PUT /api/users/:id  (update this member's role/flat within the CURRENT society)
router.put(
  '/:id',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const { role, flatNo, tower, name, phone } = req.body;
    const membership = await Membership.findOne({ where: { user: req.params.id, society: req.societyId } });
    if (!membership) return res.status(404).json({ message: 'Member not found in this society' });

    await membership.update({
      ...(role && { role }),
      ...(flatNo && { flatNo }),
      ...(tower && { tower }),
    });

    if (name || phone) {
      const user = await User.findByPk(req.params.id);
      if (user) await user.update({ ...(name && { name }), ...(phone && { phone }) });
    }
    res.json({ message: 'Member updated' });
  })
);

// @route DELETE /api/users/:id  (remove this member from the CURRENT society only - does not delete their global account)
router.delete(
  '/:id',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const membership = await Membership.findOne({ where: { user: req.params.id, society: req.societyId } });
    if (!membership) return res.status(404).json({ message: 'Member not found in this society' });
    await membership.destroy();
    res.json({ message: 'Member removed from society' });
  })
);

module.exports = router;
