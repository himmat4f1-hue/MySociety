// A single login (User row) can hold MULTIPLE memberships in a society -
// e.g. Secretary AND a Resident/Owner, or Resident of two different flats.
// Anywhere we need to dedupe "has this specific membership already
// done X" (joined a meeting, voted on an agenda item), keying on
// req.user.id alone is wrong - it conflates all of that person's
// memberships into one. This composite key (user + role + flat) uniquely
// identifies the ACTIVE membership for the current request/session.
const membershipKey = (req) => `${req.user.id}:${req.role}:${req.flatId || ''}`;

module.exports = { membershipKey };
