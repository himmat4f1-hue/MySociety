const express = require('express');
const Meeting = require('../models/Meeting');
const AgendaItem = require('../models/AgendaItem');
const MeetingAttendance = require('../models/MeetingAttendance');
const makeCrudRouter = require('../utils/makeCrudRouter');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/auditLog');

const router = express.Router();

// Meeting lifecycle status transitions - registered BEFORE the generic /:id
// routes below, same reason as other /:id/action patterns in this app
// (Express would otherwise treat "start" as an :id value).

// @route PATCH /api/meetings/:id/start
router.patch(
  '/:id/start',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.status !== 'Not yet Started') {
      return res.status(400).json({ message: `Meeting is already "${meeting.status}".` });
    }
    await meeting.update({ status: 'Started' });
    logActivity(req, { action: 'Update', resourceType: 'Meeting', resourceId: meeting.id, details: { status: 'Started' } });
    res.json(meeting);
  })
);

// @route PATCH /api/meetings/:id/status   { status: 'Counting Attendance' | 'Completed' | 'Cancelled' }
router.patch(
  '/:id/status',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    const allowed = ['Counting Attendance', 'Completed', 'Cancelled'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
    }
    await meeting.update({ status: req.body.status });
    logActivity(req, { action: 'Update', resourceType: 'Meeting', resourceId: meeting.id, details: { status: req.body.status } });
    res.json(meeting);
  })
);

// @route POST /api/meetings/:id/add-me - self check-in, only while the
// meeting's status is "Counting Attendance".
router.post(
  '/:id/add-me',
  protect,
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.status !== 'Counting Attendance') {
      return res.status(403).json({ message: 'Attendance is not being counted for this meeting right now.' });
    }

    const existing = await MeetingAttendance.findOne({ where: { meeting: meeting.id, user: req.user.id } });
    if (existing) return res.status(400).json({ message: 'You are already marked present for this meeting.' });

    const record = await MeetingAttendance.create({
      society: req.societyId,
      meeting: meeting.id,
      role: req.role,
      flatId: req.flatId || null,
      user: req.user.id,
    });
    res.status(201).json(record);
  })
);

// @route GET /api/meetings/:id/full - one meeting with its agenda items and
// attendance list attached, for the detail card (Completed/Cancelled view).
router.get(
  '/:id/full',
  protect,
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    const [agendaItems, attendance] = await Promise.all([
      AgendaItem.findAll({ where: { society: req.societyId, meeting: meeting.id } }),
      MeetingAttendance.count({ where: { society: req.societyId, meeting: meeting.id } }),
    ]);
    res.json({ ...meeting.toJSON(), agendaItems, attendanceCount: attendance });
  })
);

// @route GET /api/meetings/by-date?date=YYYY-MM-DD - meetings scheduled on
// that day, each with its agenda-item count attached, for the Meetings page
// list view. Defaults to today when no date is given.
router.get(
  '/by-date',
  protect,
  asyncHandler(async (req, res) => {
    const { Op } = require('sequelize');
    const day = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const meetings = await Meeting.findAll({ where: { society: req.societyId, date: { [Op.between]: [start, end] } }, order: [['date', 'ASC']] });
    const meetingIds = meetings.map((m) => m.id);
    const agendaCounts = meetingIds.length
      ? await AgendaItem.findAll({
          where: { meeting: { [Op.in]: meetingIds } },
          attributes: ['meeting', [AgendaItem.sequelize.fn('COUNT', AgendaItem.sequelize.col('id')), 'count']],
          group: ['meeting'],
          raw: true,
        })
      : [];
    const countByMeeting = new Map(agendaCounts.map((r) => [r.meeting, parseInt(r.count, 10)]));

    res.json(meetings.map((m) => ({ ...m.toJSON(), agendaCount: countByMeeting.get(m.id) || 0 })));
  })
);

router.use('/', makeCrudRouter(Meeting, { searchFields: ['title', 'type', 'agenda'] }, { read: 'any', write: ['secretary', 'treasurer'] }));

module.exports = router;
