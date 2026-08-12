const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const MeetingAttendance = require('../models/MeetingAttendance');
const { protect } = require('../middleware/auth');

// List attendance for a meeting (or all meetings) - visible to everyone.
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const query = { society: req.societyId };
    if (req.query.meeting) query.meeting = req.query.meeting;
    const data = await MeetingAttendance.find(query).populate('user', 'name').sort({ checkedInAt: -1 });
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

    const existing = await MeetingAttendance.findOne({ meeting: meetingId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You are already checked in to this meeting' });

    const record = await MeetingAttendance.create({
      society: req.societyId,
      meeting: meetingId,
      role: req.role,
      flatId: req.flatId,
      user: req.user._id,
    });

    res.status(201).json(record);
  })
);

module.exports = router;
