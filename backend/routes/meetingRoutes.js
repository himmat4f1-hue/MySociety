const express = require('express');
const { Op } = require('sequelize');
const Meeting = require('../models/Meeting');
const AgendaItem = require('../models/AgendaItem');
const MeetingAttendance = require('../models/MeetingAttendance');
const Membership = require('../models/Membership');
const MeetingSettings = require('../models/MeetingSettings');
const makeCrudRouter = require('../utils/makeCrudRouter');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/auditLog');
const { ALL_MANAGEMENT } = require('../config/permissions');

const router = express.Router();

// Real (not hardcoded) quorum totals for this society: "Members" = active
// resident+tenant memberships, "Management" = active secretary/chairman/
// treasurer/committee_member memberships.
const getQuorumTotals = async (societyId) => {
  const [totalMembers, totalManagement] = await Promise.all([
    Membership.count({ where: { society: societyId, role: { [Op.in]: ['resident', 'tenant'] }, status: 'active' } }),
    Membership.count({ where: { society: societyId, role: { [Op.in]: ALL_MANAGEMENT }, status: 'active' } }),
  ]);
  return { totalMembers, totalManagement };
};

// Society-wide quorum minimums (Settings page) - same for every meeting,
// never set per-meeting. Auto-creates a default row (1/1) the first time a
// society is asked for it, so this never 404s.
const getQuorumSettings = async (societyId) => {
  const [row] = await MeetingSettings.findOrCreate({ where: { society: societyId }, defaults: { society: societyId } });
  return row;
};

// Attaches "Building No." (derived from flatId's tower-letter prefix, e.g.
// "A-101" -> "A") and resolves each joiner's flat, for the joiners table.
const buildingFromFlatId = (flatId) => (flatId ? flatId.split('-')[0] : '—');

// @route GET /api/meetings/by-date?date=YYYY-MM-DD - meetings scheduled on
// that day, each with its agenda-item count, for the Meetings list view.
router.get(
  '/by-date',
  protect,
  asyncHandler(async (req, res) => {
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

// @route GET /api/meetings/quorum-settings - Settings page reads/writes this
// (Secretary only for write). One row per society, applies to ALL meetings.
router.get(
  '/quorum-settings',
  protect,
  asyncHandler(async (req, res) => {
    const row = await getQuorumSettings(req.societyId);
    res.json(row);
  })
);

router.put(
  '/quorum-settings',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const row = await getQuorumSettings(req.societyId);
    const { minRequiredMembers, minRequiredManagement } = req.body;
    await row.update({
      minRequiredMembers: minRequiredMembers ?? row.minRequiredMembers,
      minRequiredManagement: minRequiredManagement ?? row.minRequiredManagement,
    });
    res.json(row);
  })
);

// @route PATCH /api/meetings/:id/start-attendance - Step 1 -> Step 2
// (Secretary only). "Upcoming" -> "In Progress".
router.patch(
  '/:id/start-attendance',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.status !== 'Upcoming') return res.status(400).json({ message: `Meeting is already "${meeting.status}".` });
    await meeting.update({ status: 'In Progress' });
    logActivity(req, { action: 'Update', resourceType: 'Meeting', resourceId: meeting.id, details: { status: 'In Progress' } });
    res.json(meeting);
  })
);

// @route PATCH /api/meetings/:id/stop - "Stop Meeting" (Secretary only).
// "In Progress" -> "Completed".
router.patch(
  '/:id/stop',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.status !== 'In Progress') return res.status(400).json({ message: 'Only a meeting that is In Progress can be stopped.' });
    await meeting.update({ status: 'Completed' });
    logActivity(req, { action: 'Update', resourceType: 'Meeting', resourceId: meeting.id, details: { status: 'Completed' } });
    res.json(meeting);
  })
);

// @route PATCH /api/meetings/:id/cancel - "Cancel Meeting" (Secretary only).
// Allowed from Upcoming OR In Progress.
router.patch(
  '/:id/cancel',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (!['Upcoming', 'In Progress'].includes(meeting.status)) {
      return res.status(400).json({ message: `Cannot cancel a meeting that is already "${meeting.status}".` });
    }
    await meeting.update({ status: 'Cancelled' });
    logActivity(req, { action: 'Update', resourceType: 'Meeting', resourceId: meeting.id, details: { status: 'Cancelled' } });
    res.json(meeting);
  })
);

// @route POST /api/meetings/:id/add-me - self check-in ("Add Me"). Allowed
// any time the meeting is "In Progress" - joining is what unlocks the full
// voting view (Step 4) for that person, it doesn't itself change the
// meeting's overall status.
router.post(
  '/:id/add-me',
  protect,
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.status !== 'In Progress') {
      return res.status(403).json({ message: 'This meeting is not in progress right now.' });
    }

    const existing = await MeetingAttendance.findOne({ where: { meeting: meeting.id, user: req.user.id } });
    if (existing) return res.status(400).json({ message: 'You are already marked present for this meeting.' });

    const record = await MeetingAttendance.create({
      society: req.societyId,
      meeting: meeting.id,
      role: req.role,
      flatId: req.flatId || null,
      user: req.user.id,
      userName: req.user.name,
    });
    res.status(201).json(record);
  })
);

// @route POST /api/meetings/:id/exit - "Exit from Meeting" - a joined
// person's own UI action to leave the live view. Does NOT remove their
// attendance record (they're still counted as having joined/attended for
// quorum) - it just stamps exitedAt, so re-opening this meeting later won't
// show the "Exit from Meeting" button again.
router.post(
  '/:id/exit',
  protect,
  asyncHandler(async (req, res) => {
    const attendance = await MeetingAttendance.findOne({ where: { meeting: req.params.id, user: req.user.id } });
    if (attendance && !attendance.exitedAt) {
      await attendance.update({ exitedAt: new Date() });
    }
    res.json({ message: 'Left the meeting view. Your attendance is still recorded.' });
  })
);

// @route GET /api/meetings/:id/full - everything the detail card needs:
// quorum totals/joined counts, whether the CURRENT user has joined, the
// agenda items (each with a computed leading "decision"), and the full
// joiners list with Building/Flat/Name/Role.
router.get(
  '/:id/full',
  protect,
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const [agendaItemsRaw, attendanceRows, quorum, quorumSettings, myAttendance] = await Promise.all([
      AgendaItem.findAll({ where: { society: req.societyId, meeting: meeting.id } }),
      MeetingAttendance.findAll({ where: { society: req.societyId, meeting: meeting.id }, order: [['checkedInAt', 'ASC']] }),
      getQuorumTotals(req.societyId),
      getQuorumSettings(req.societyId),
      MeetingAttendance.findOne({ where: { meeting: meeting.id, user: req.user.id } }),
    ]);

    const agendaItems = agendaItemsRaw.map((item) => {
      const options = item.voteOptions?.length ? item.voteOptions : [{ label: 'Cancel', votes: 0 }, { label: 'Reject', votes: 0 }, { label: 'Approve', votes: 0 }];
      const leading = options.reduce((best, o) => (o.votes > (best?.votes || -1) ? o : best), null);
      return { ...item.toJSON(), voteOptions: options, decision: leading };
    });

    const joinedMembers = attendanceRows.filter((a) => ['resident', 'tenant'].includes(a.role)).length;
    const joinedManagement = attendanceRows.filter((a) => ALL_MANAGEMENT.includes(a.role)).length;

    res.json({
      ...meeting.toJSON(),
      agendaItems,
      hasJoined: !!myAttendance,
      hasExited: !!(myAttendance && myAttendance.exitedAt),
      attendance: {
        totalMembers: quorum.totalMembers,
        joinedMembers,
        minRequiredMembers: quorumSettings.minRequiredMembers,
        totalManagement: quorum.totalManagement,
        joinedManagement,
        minRequiredManagement: quorumSettings.minRequiredManagement,
      },
      joiners: attendanceRows.map((a) => ({
        _id: a.id,
        buildingNo: buildingFromFlatId(a.flatId),
        flatNo: a.flatId || '—',
        name: a.userName || '—',
        role: ALL_MANAGEMENT.includes(a.role) ? 'Management' : a.role === 'resident' || a.role === 'tenant' ? 'Member' : a.role,
      })),
    });
  })
);

router.use('/', makeCrudRouter(Meeting, { searchFields: ['title', 'type', 'agenda'] }, { read: 'any', write: ['secretary', 'treasurer'] }));

module.exports = router;
