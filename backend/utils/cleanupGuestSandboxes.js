// Deletes expired guest sandbox societies and everything inside them.
// Runs automatically every few hours from server.js (see setupGuestCleanupJob),
// and can also be run manually: node utils/cleanupGuestSandboxes.js
const Society = require('../models/Society');
const Membership = require('../models/Membership');
const User = require('../models/User');

const MODEL_NAMES = [
  'Unit', 'Building', 'Resident', 'Pet', 'Visitor', 'Complaint', 'Maintenance', 'Notice',
  'Amenity', 'Document', 'Invoice', 'Transaction', 'Meeting', 'Poll', 'Emergency',
  'CameraRequest', 'Policy', 'Investment', 'Fund', 'GatePass', 'Shift', 'Task',
  'Supply', 'Lease', 'FlatOwner', 'FamilyMember', 'Vehicle', 'HomeService',
  'RoleChecklist', 'AgendaItem', 'MeetingAttendance', 'CommitteeVote', 'ManagementVote',
];

const cleanupExpiredGuestSandboxes = async () => {
  const expired = await Society.find({ isGuestSandbox: true, expiresAt: { $lt: new Date() } });
  if (!expired.length) return { deletedSocieties: 0 };

  for (const society of expired) {
    for (const modelName of MODEL_NAMES) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const Model = require(`../models/${modelName}`);
      // eslint-disable-next-line no-await-in-loop
      await Model.deleteMany({ society: society._id });
    }

    const memberships = await Membership.find({ society: society._id });
    const userIds = memberships.map((m) => m.user);
    await Membership.deleteMany({ society: society._id });
    // Only delete the guest User accounts themselves (they're single-use, sandbox-only accounts)
    await User.deleteMany({ _id: { $in: userIds }, email: { $regex: '@sandbox.mysociety.local$' } });

    await Society.deleteOne({ _id: society._id });
    console.log(`Cleaned up expired guest sandbox: ${society.name}`);
  }

  return { deletedSocieties: expired.length };
};

// Schedules the cleanup to run every hour for as long as the server process is alive.
const setupGuestCleanupJob = () => {
  const RUN_EVERY_MS = 60 * 60 * 1000; // 1 hour
  setInterval(() => {
    cleanupExpiredGuestSandboxes().catch((err) => console.error('Guest sandbox cleanup failed:', err.message));
  }, RUN_EVERY_MS);
  // Also run once shortly after boot
  setTimeout(() => {
    cleanupExpiredGuestSandboxes().catch((err) => console.error('Guest sandbox cleanup failed:', err.message));
  }, 30 * 1000);
};

// Allow running directly: node utils/cleanupGuestSandboxes.js
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    const result = await cleanupExpiredGuestSandboxes();
    console.log(`Done. Deleted ${result.deletedSocieties} expired guest sandbox(es).`);
    process.exit(0);
  });
}

module.exports = { cleanupExpiredGuestSandboxes, setupGuestCleanupJob };
