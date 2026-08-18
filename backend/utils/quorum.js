const Unit = require('../models/Unit');
const MeetingSettings = require('../models/MeetingSettings');
const { ALL_MANAGEMENT } = require('../config/permissions');

const DEFAULT_MANAGEMENT_ROLES = [
  { role: 'secretary', label: 'Secretary', count: 1, enabled: true },
  { role: 'chairman', label: 'Chairman', count: 1, enabled: true },
  { role: 'treasurer', label: 'Treasurer', count: 1, enabled: true },
  { role: 'accountant', label: 'Accountant', count: 1, enabled: true },
  { role: 'committee_member', label: 'Committee Member', count: 5, enabled: true },
];

// Society-wide quorum minimums AND the configurable Management-roles list
// (Settings page) - same for every meeting, never set per-meeting.
// Auto-creates a default row the first time a society is asked for it, so
// this never 404s. Also backfills managementRoles for rows created before
// that column existed.
const getQuorumSettings = async (societyId) => {
  const [row] = await MeetingSettings.findOrCreate({
    where: { society: societyId },
    defaults: { society: societyId, managementRoles: DEFAULT_MANAGEMENT_ROLES },
  });
  if (!row.managementRoles || !row.managementRoles.length) {
    await row.update({ managementRoles: DEFAULT_MANAGEMENT_ROLES });
  }
  return row;
};

// The set of role strings currently configured (and enabled) as
// "Management" for MEETING attendance/quorum/voting-eligibility purposes.
// NOT a hardcoded list - the Settings page lets the Secretary add, remove,
// or disable roles here, and every meeting-related "is this person
// Management?" check should use this instead of a fixed array, so removing
// a role from Settings actually removes it everywhere at once.
const getManagementRoleSet = async (societyId) => {
  const settings = await getQuorumSettings(societyId);
  return (settings.managementRoles || []).filter((r) => r.enabled).map((r) => r.role);
};

// "Total (Members/General)" = actual number of flats/units in the society
// (one flat = one voting entity, regardless of how many resident/tenant
// login accounts are attached to it). "Total (Management)" = sum of the
// configured `count` for every enabled role in managementRoles - a target
// headcount the Secretary defines (e.g. "Committee Member: 5"), not simply
// however many people happen to currently hold that role.
const getQuorumTotals = async (societyId) => {
  const [totalMembers, settings] = await Promise.all([
    Unit.count({ where: { society: societyId } }),
    getQuorumSettings(societyId),
  ]);
  const totalManagement = (settings.managementRoles || [])
    .filter((r) => r.enabled)
    .reduce((sum, r) => sum + (Number(r.count) || 0), 0);
  return { totalMembers, totalManagement };
};

module.exports = { getQuorumTotals, getQuorumSettings, getManagementRoleSet, ALL_MANAGEMENT };
