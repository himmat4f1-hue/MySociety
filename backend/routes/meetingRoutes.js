const express = require('express');
const { Op } = require('sequelize');
const Meeting = require('../models/Meeting');
const AgendaItem = require('../models/AgendaItem');
const MeetingAttendance = require('../models/MeetingAttendance');
const makeCrudRouter = require('../utils/makeCrudRouter');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../utils/auditLog');
const { getQuorumTotals, getQuorumSettings, getManagementRoleSet } = require('../utils/quorum');
const { membershipKey } = require('../utils/membership');

const router = express.Router();

// Whether the relevant attendance category (General members for a General
// meeting, Management for a Committee meeting) has met its configured
// minimum for this specific meeting right now. Shared by /stop (backend
// enforcement) and /:id/full (UI gating of Stop Meeting / the voting table).
const isQuorumMetForMeeting = async (meeting, societyId) => {
  const isGeneral = meeting.type !== 'Committee';
  const [quorumSettings, managementRoleSet, attendanceRows] = await Promise.all([
    getQuorumSettings(societyId),
    getManagementRoleSet(societyId),
    MeetingAttendance.findAll({ where: { society: societyId, meeting: meeting.id } }),
  ]);
  const joinedCount = isGeneral
    ? attendanceRows.filter((a) => ['resident', 'tenant'].includes(a.role)).length
    : attendanceRows.filter((a) => managementRoleSet.includes(a.role)).length;
  const requiredCount = isGeneral ? quorumSettings.minRequiredMembers : quorumSettings.minRequiredManagement;
  return joinedCount >= requiredCount;
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
    const { minRequiredMembers, minRequiredManagement, managementRoles } = req.body;

    let cleanedRoles = row.managementRoles;
    if (Array.isArray(managementRoles)) {
      // Basic shape validation so a malformed payload can't corrupt the
      // list every meeting-attendance calculation depends on.
      cleanedRoles = managementRoles
        .filter((r) => r && typeof r.role === 'string' && r.role.trim())
        .map((r) => ({
          role: r.role.trim(),
          label: (r.label || r.role).trim(),
          count: Math.max(0, Number(r.count) || 0),
          enabled: r.enabled !== false,
        }));
    }

    await row.update({
      minRequiredMembers: minRequiredMembers ?? row.minRequiredMembers,
      minRequiredManagement: minRequiredManagement ?? row.minRequiredManagement,
      managementRoles: cleanedRoles,
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
// "In Progress" -> "Completed". Only allowed once the relevant category
// (General members for a General meeting, Management for a Committee
// meeting) has met its configured minimum attendance.
router.patch(
  '/:id/stop',
  protect,
  authorize('secretary'),
  asyncHandler(async (req, res) => {
    const meeting = await Meeting.findOne({ where: { id: req.params.id, society: req.societyId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.status !== 'In Progress') return res.status(400).json({ message: 'Only a meeting that is In Progress can be stopped.' });
    if (!(await isQuorumMetForMeeting(meeting, req.societyId))) {
      return res.status(400).json({ message: 'Minimum required attendance has not been met yet for this meeting.' });
    }
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

    // Dedupe is per (meeting, user, role, flatId) - see the
    // MeetingAttendance model note: the same login can hold multiple
    // memberships (e.g. Secretary AND a Resident, or Resident of two
    // different flats), and each one joins independently.
    const existing = await MeetingAttendance.findOne({ where: { meeting: meeting.id, user: req.user.id, role: req.role, flatId: req.flatId || null } });
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
    // Only exits THIS role's attendance (see model note) - if the same
    // person is also joined under a different role in this meeting, that
    // other attendance/session is untouched.
    const attendance = await MeetingAttendance.findOne({ where: { meeting: req.params.id, user: req.user.id, role: req.role, flatId: req.flatId || null } });
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

    const [agendaItemsRaw, attendanceRows, quorum, quorumSettings, managementRoleSet, myAttendance] = await Promise.all([
      AgendaItem.findAll({ where: { society: req.societyId, meeting: meeting.id }, order: [['createdAt', 'ASC']] }),
      MeetingAttendance.findAll({ where: { society: req.societyId, meeting: meeting.id }, order: [['checkedInAt', 'ASC']] }),
      getQuorumTotals(req.societyId),
      getQuorumSettings(req.societyId),
      getManagementRoleSet(req.societyId),
      // hasJoined/hasExited must reflect THIS session's active role, not
      // just this login - see the model note on why (meeting, user) alone
      // is wrong when one person holds multiple memberships.
      MeetingAttendance.findOne({ where: { meeting: meeting.id, user: req.user.id, role: req.role, flatId: req.flatId || null } }),
    ]);

    const myKey = membershipKey(req);
    const agendaItems = agendaItemsRaw.map((item) => {
      const options = item.voteOptions?.length ? item.voteOptions : [{ label: 'Approve', votes: 0 }, { label: 'Reject/Cancel', votes: 0 }];
      const json = item.toJSON();
      delete json.voters; // never expose who voted - just whether THIS membership has (below)

      // Decision (#3): if two-or-more options are tied for the top vote
      // count, there's no automatic winner - the Secretary must pick one
      // (see finalDecision + /resolve-tie). tiedOptions is only populated
      // (for the frontend to render radio buttons) when a real, unresolved
      // tie exists; once the Secretary resolves it, finalDecision wins
      // regardless of the raw numbers, and tiedOptions goes back to empty.
      const topVotes = options.length ? Math.max(...options.map((o) => o.votes || 0)) : 0;
      const tiedAtTop = topVotes > 0 ? options.filter((o) => (o.votes || 0) === topVotes) : [];
      const resolvedDecision = item.finalDecision ? options.find((o) => o.label === item.finalDecision) || null : null;
      const decision = resolvedDecision || (tiedAtTop.length === 1 ? tiedAtTop[0] : null);
      const tiedOptions = !resolvedDecision && tiedAtTop.length > 1 ? tiedAtTop : [];

      return { ...json, voteOptions: options, decision, tiedOptions, hasVoted: (item.voters || []).includes(myKey) };
    });

    const joinedMembers = attendanceRows.filter((a) => ['resident', 'tenant'].includes(a.role)).length;
    const joinedManagement = attendanceRows.filter((a) => managementRoleSet.includes(a.role)).length;

    res.json({
      ...meeting.toJSON(),
      agendaItems,
      hasJoined: !!myAttendance,
      hasExited: !!(myAttendance && myAttendance.exitedAt),
      managementRoleSet,
      attendance: {
        totalMembers: quorum.totalMembers,
        joinedMembers,
        minRequiredMembers: quorumSettings.minRequiredMembers,
        totalManagement: quorum.totalManagement,
        joinedManagement,
        minRequiredManagement: quorumSettings.minRequiredManagement,
      },
      // A joiner "counts" for quorum only if their role matches THIS
      // meeting's relevant category (General meeting -> resident/tenant,
      // Committee meeting -> Management). Anyone who joins from the other
      // category is still allowed to join and is listed here, but flagged
      // isWitness so the UI can show them as an "extra witness" rather than
      // implying they contributed to quorum - matches joinedMembers/
      // joinedManagement above, which already exclude them from the count.
      joiners: attendanceRows.map((a) => {
        const isManagementRole = managementRoleSet.includes(a.role);
        const matchesMeetingCategory = meeting.type === 'Committee' ? isManagementRole : !isManagementRole;
        return {
          _id: a.id,
          buildingNo: buildingFromFlatId(a.flatId),
          flatNo: a.flatId || '—',
          name: a.userName || '—',
          role: isManagementRole ? 'Management' : a.role === 'resident' || a.role === 'tenant' ? 'Member' : a.role,
          isWitness: !matchesMeetingCategory,
        };
      }),
    });
  })
);

router.use('/', makeCrudRouter(Meeting, { searchFields: ['title', 'type', 'agenda'] }, { read: 'any', write: ['secretary', 'treasurer'] }));

module.exports = router;
