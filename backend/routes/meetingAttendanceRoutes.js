const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const MeetingAttendance = require('../models/MeetingAttendance');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

// List attendance for a meeting (or all meetings) - visible to everyone.
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const where = { society: req.societyId };
    if (req.query.meeting) where.meeting = req.query.meeting;
    const rows = await MeetingAttendance.findAll({ where, order: [['checkedInAt', 'DESC']] });

    const userIds = [...new Set(rows.map((r) => r.user).filter(Boolean))];
    const users = await User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'name'] });
    const userById = new Map(users.map((u) => [u.id, u.toJSON()]));

    const data = rows.map((r) => {
      const json = r.toJSON();
      json.user = userById.get(json.user) || json.user;
      return json;
    });

    res.json({ data, total: data.length });
  })
);

// Self check-in: "Add Me" button. Role + flatId are captured automatically
// from the caller's own active session - never accepted from the request body,
// so nobody can mark someone else present or misrepresent their own role.
router.post(
  '/check-in',
  protect,
  asyncHandler(async (req, res) => {
    const { meetingId } = req.body;
    if (!meetingId) return res.status(400).json({ message: 'meetingId is required' });

    const existing = await MeetingAttendance.findOne({ where: { meeting: meetingId, user: req.user.id } });
    if (existing) return res.status(400).json({ message: 'You are already checked in to this meeting' });

    const record = await MeetingAttendance.create({
      society: req.societyId,
      meeting: meetingId,
      role: req.role,
      flatId: req.flatId,
      user: req.user.id,
    });

    res.status(201).json(record);
  })
);

module.exports = router;
