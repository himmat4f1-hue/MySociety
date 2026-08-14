// Central permission matrix. Every role-gated action in the app should check
// through here rather than hardcoding role arrays in individual routes/pages
// - this is the single place that answers "which role can Add/Edit/Delete/
// Upload/Download/Pay for X" so it can be audited and changed in one place
// instead of being scattered across 30+ route files.
//
// Roles: security, resident, accountant, secretary, chairman, treasurer,
// committee_member, tenant, housekeeping

const ALL_MANAGEMENT = ['secretary', 'chairman', 'treasurer', 'committee_member'];

// resource -> { view: [...roles or 'any'], create/update/delete/upload/download/pay: [...roles] }
// 'any' means every authenticated member of the society (still society-scoped).
const PERMISSIONS = {
  // --- Financial ---
  invoices: { view: 'any', create: ['secretary', 'accountant', 'treasurer'], update: ['secretary', 'accountant', 'treasurer'], delete: ['secretary', 'treasurer'], download: 'any', pay: ['resident', 'tenant'] },
  transactions: { view: ['secretary', 'accountant', 'treasurer', 'chairman'], create: ['secretary', 'accountant', 'treasurer'], update: ['secretary', 'accountant', 'treasurer'], delete: ['treasurer'], upload: ['secretary', 'accountant', 'treasurer'] },
  funds: { view: 'any', create: ['secretary', 'treasurer'], update: ['secretary', 'treasurer'], delete: ['treasurer'] },
  investments: { view: ['secretary', 'chairman', 'treasurer'], create: ['treasurer'], update: ['treasurer'], delete: ['treasurer'] },
  dues: { view: 'any', create: ['secretary', 'accountant'], update: ['secretary', 'accountant'], pay: ['resident', 'tenant'] },

  // --- People / Census ---
  residents: { view: ALL_MANAGEMENT, create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  familyMembers: { view: 'any', create: ['resident', 'tenant', 'secretary'], update: ['resident', 'tenant', 'secretary'], delete: ['resident', 'tenant', 'secretary'] },
  flatOwners: { view: ALL_MANAGEMENT, create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  vehicles: { view: 'any', create: ['resident', 'tenant', 'secretary'], update: ['resident', 'tenant', 'secretary'], delete: ['resident', 'tenant', 'secretary'] },
  pets: { view: 'any', create: ['resident', 'tenant', 'secretary'], update: ['resident', 'tenant', 'secretary'], delete: ['resident', 'tenant', 'secretary'] },
  homeServices: { view: 'any', create: ['resident', 'tenant', 'secretary'], update: ['resident', 'tenant', 'secretary'], delete: ['resident', 'tenant', 'secretary'] },
  visitors: { view: ['security', 'secretary', 'chairman'], create: ['security'], update: ['security'], delete: ['security', 'secretary'] },

  // --- Staff ---
  shifts: { view: ['secretary', 'chairman'], create: ['secretary'], update: ['secretary'], delete: ['secretary'] },

  // --- Amenities / Bookings ---
  amenities: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  amenityBookings: { view: 'any', create: ['resident', 'tenant', 'secretary'], update: ['secretary'], delete: ['resident', 'tenant', 'secretary'] },

  // --- Meetings / Voting ---
  meetings: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  agendaItems: { view: 'any', create: ['secretary'], update: ['secretary'], vote: ALL_MANAGEMENT },
  committeeVotes: { view: 'any', create: 'any' },
  managementVotes: { view: ALL_MANAGEMENT, create: ['committee_member'] },

  // --- Requests ---
  complaints: { view: 'any', create: 'any', update: ['secretary'], delete: ['secretary'] },
  maintenance: { view: 'any', create: 'any', update: ['secretary'], delete: ['secretary'] },
  cameraRequests: { view: ['secretary', 'chairman'], create: 'any', update: ['secretary'] },
  emergencies: { view: ['secretary', 'chairman', 'security'], create: 'any', update: ['secretary'] },

  // --- Docs / Governance ---
  documents: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'], download: 'any', upload: ['secretary'] },
  policies: { view: 'any', create: ['secretary', 'treasurer'], update: ['secretary', 'treasurer'], delete: ['secretary'] },
  rules: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  notices: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  roleChecklist: { view: ALL_MANAGEMENT, create: ['secretary'], update: ['secretary'] },
  serviceProviderContacts: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  inventory: { view: ALL_MANAGEMENT, create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  insurance: { view: ALL_MANAGEMENT, create: ['secretary', 'treasurer'], update: ['secretary', 'treasurer'], delete: ['secretary'] },
  feedback: { view: ALL_MANAGEMENT, create: 'any', update: ['secretary'], delete: ['secretary'] },
  supportTickets: { view: 'any', create: 'any', update: ['secretary'], delete: ['secretary'] },
  legalCompliance: { view: ALL_MANAGEMENT, create: ['secretary', 'chairman'], update: ['secretary', 'chairman'], delete: ['secretary'] },
  utilityReadings: { view: ALL_MANAGEMENT, create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  auditLog: { view: ['secretary', 'chairman'] },

  // --- Leases / Parking / Structure ---
  leases: { view: ALL_MANAGEMENT, create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  parking: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  units: { view: 'any', create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  societyStructure: { view: ALL_MANAGEMENT, create: ['chairman'], update: ['chairman'], delete: ['chairman'] },

  // --- Admin ---
  users: { view: ALL_MANAGEMENT, create: ['secretary'], update: ['secretary'], delete: ['secretary'] },
  gatePasses: { view: ['security', 'secretary'], create: ['security', 'secretary'], update: ['security', 'secretary'] },
  tasks: { view: ['secretary', 'housekeeping'], create: ['secretary'], update: ['secretary', 'housekeeping'], delete: ['secretary'] },
  supplies: { view: ['secretary', 'housekeeping'], create: ['secretary', 'housekeeping'], update: ['secretary', 'housekeeping'], delete: ['secretary'] },
};

// can(role, resource, action) -> boolean
const can = (role, resource, action) => {
  const rule = PERMISSIONS[resource];
  if (!rule) return false;
  const allowed = rule[action];
  if (!allowed) return false;
  if (allowed === 'any') return true;
  return allowed.includes(role);
};

// Express middleware factory: requirePermission('invoices', 'create')
const requirePermission = (resource, action) => (req, res, next) => {
  if (!can(req.role, resource, action)) {
    return res.status(403).json({ message: `Your role (${req.role}) is not permitted to ${action} ${resource}.` });
  }
  next();
};

// Bridges the permission matrix to makeCrudRouter's simpler {read, write}
// shape (used by modules where create/update/delete share the same role
// set - most of the simple reference-data modules do).
const rolesFor = (resource) => {
  const rule = PERMISSIONS[resource];
  if (!rule) return { read: 'any', write: 'any' };
  return { read: rule.view || 'any', write: rule.create || 'any' };
};

module.exports = { PERMISSIONS, can, requirePermission, ALL_MANAGEMENT, rolesFor };
