const { Op } = require('sequelize');
const Membership = require('../models/Membership');
const MeetingSettings = require('../models/MeetingSettings');
const { ALL_MANAGEMENT } = require('../config/permissions');

// Real (not hardcoded) quorum totals for a society: "Members" = active
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

module.exports = { getQuorumTotals, getQuorumSettings, ALL_MANAGEMENT };
