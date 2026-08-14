// Shared helper that writes to ActivityLog. Called from genericController and
// flatPrivateController after a successful create/update/delete - never
// blocks or fails the actual request if logging itself has a problem (a
// broken audit log shouldn't take the app down).
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (req, { action, resourceType, resourceId, details }) => {
  try {
    await ActivityLog.create({
      society: req.societyId,
      user: req.user?.id || null,
      userName: req.user?.name || null,
      userRole: req.role || null,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : null,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      details: details || {},
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = { logActivity };
