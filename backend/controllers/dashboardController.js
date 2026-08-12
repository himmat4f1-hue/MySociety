const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const Membership = require('../models/Membership');
const Unit = require('../models/Unit');
const Visitor = require('../models/Visitor');
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const Notice = require('../models/Notice');
const Amenity = require('../models/Amenity');
const Document = require('../models/Document');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Meeting = require('../models/Meeting');
const Poll = require('../models/Poll');
const Pet = require('../models/Pet');
const Vehicle = require('../models/Vehicle');
const HomeService = require('../models/HomeService');
const Fund = require('../models/Fund');
const Investment = require('../models/Investment');
const User = require('../models/User');

// @desc  Get overview stats for the main dashboard (role-aware), scoped to the
// current society only (req.societyId comes from the JWT via auth middleware).
// @route GET /api/dashboard/overview
const getOverview = asyncHandler(async (req, res) => {
  const sid = req.societyId;
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

  const [
    totalUnits,
    occupiedUnits,
    vacantUnits,
    maintenanceUnits,
    totalResidents,
    totalVisitorsToday,
    currentlyInside,
    openComplaints,
    openMaintenance,
    totalNotices,
    publishedNotices,
    totalAmenities,
    availableAmenities,
    totalDocuments,
    upcomingMeetings,
    activePolls,
    collection,
    expense,
    outstanding,
  ] = await Promise.all([
    Unit.count({ where: { society: sid } }),
    Unit.count({ where: { society: sid, status: 'Occupied' } }),
    Unit.count({ where: { society: sid, status: 'Vacant' } }),
    Unit.count({ where: { society: sid, status: 'Maintenance' } }),
    Membership.count({ where: { society: sid, role: { [Op.in]: ['resident', 'tenant'] } } }),
    Visitor.count({ where: { society: sid, createdAt: { [Op.gte]: startOfToday } } }),
    Visitor.count({ where: { society: sid, status: 'Inside' } }),
    Complaint.count({ where: { society: sid, status: { [Op.in]: ['Open', 'In Process'] } } }),
    Maintenance.count({ where: { society: sid, status: { [Op.in]: ['Open', 'Overdue'] } } }),
    Notice.count({ where: { society: sid } }),
    Notice.count({ where: { society: sid, status: 'Published' } }),
    Amenity.count({ where: { society: sid } }),
    Amenity.count({ where: { society: sid, status: 'Available' } }),
    Document.count({ where: { society: sid } }),
    Meeting.count({ where: { society: sid, date: { [Op.gte]: new Date() } } }),
    Poll.count({ where: { society: sid, status: 'Active' } }),
    Transaction.sum('amount', { where: { society: sid, type: 'Income' } }),
    Transaction.sum('amount', { where: { society: sid, type: 'Expense' } }),
    Invoice.sum('amount', { where: { society: sid, status: { [Op.in]: ['Pending', 'Overdue'] } } }),
  ]);

  res.json({
    units: { total: totalUnits, occupied: occupiedUnits, vacant: vacantUnits, maintenance: maintenanceUnits },
    residents: { total: totalResidents },
    visitors: { today: totalVisitorsToday, inside: currentlyInside },
    complaints: { open: openComplaints },
    maintenance: { open: openMaintenance },
    notices: { total: totalNotices, published: publishedNotices },
    amenities: { total: totalAmenities, available: availableAmenities },
    documents: { total: totalDocuments },
    meetings: { upcoming: upcomingMeetings },
    polls: { active: activePolls },
    finance: {
      collection: collection || 0,
      expense: expense || 0,
      outstanding: outstanding || 0,
    },
  });
});

// @desc  Rich, secretary-focused overview: breakdowns by type/priority plus
// the counts from getOverview above, all scoped to the caller's society.
// Powers the detailed Secretary Dashboard screen.
// @route GET /api/dashboard/secretary
const getSecretaryOverview = asyncHandler(async (req, res) => {
  const sid = req.societyId;

  const countBy = async (Model, field, extraWhere = {}) => {
    const rows = await Model.findAll({
      where: { society: sid, ...extraWhere },
      attributes: [field, [Model.sequelize.fn('COUNT', Model.sequelize.col('id')), 'count']],
      group: [field],
      raw: true,
    });
    return rows.reduce((acc, r) => {
      acc[r[field] || 'Other'] = parseInt(r.count, 10);
      return acc;
    }, {});
  };

  const [
    unitsByStatus,
    petsByType,
    vehiclesByType,
    homeServicesByType,
    pendingComplaintsByPriority,
    resolvedComplaintsByPriority,
    upcomingMeetings,
    amenities,
    funds,
    investments,
    management,
    leasesExpiringSoon,
    pendingLeaseCount,
    finance,
    totalResidents,
    totalVisitorsToday,
    securityStaffCount,
    housekeepingStaffCount,
  ] = await Promise.all([
    countBy(Unit, 'status'),
    countBy(Pet, 'type'),
    countBy(Vehicle, 'vehicleType'),
    countBy(HomeService, 'type'),
    countBy(Complaint, 'priority', { status: { [Op.in]: ['Open', 'In Process'] } }),
    countBy(Complaint, 'priority', { status: 'Resolved' }),
    Meeting.findAll({ where: { society: sid, date: { [Op.gte]: new Date() } }, order: [['date', 'ASC']], limit: 5 }),
    Amenity.findAll({ where: { society: sid } }),
    Fund.findAll({ where: { society: sid } }),
    Investment.findAll({ where: { society: sid } }),
    Membership.findAll({ where: { society: sid, role: { [Op.notIn]: ['resident', 'tenant'] } } }),
    require('../models/Lease').count({ where: { society: sid, status: 'Expiring Soon' } }),
    require('../models/Lease').count({ where: { society: sid } }),
    Transaction.findAll({ where: { society: sid } }),
    Membership.count({ where: { society: sid, role: { [Op.in]: ['resident', 'tenant'] }, status: 'active' } }),
    Visitor.count({ where: { society: sid, createdAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    Membership.count({ where: { society: sid, role: 'security', status: 'active' } }),
    Membership.count({ where: { society: sid, role: 'housekeeping', status: 'active' } }),
  ]);

  const managementUserIds = [...new Set(management.map((m) => m.user))];
  const managementUsers = await User.findAll({ where: { id: { [Op.in]: managementUserIds } }, attributes: ['id', 'name'] });
  const nameById = new Map(managementUsers.map((u) => [u.id, u.name]));
  const managementList = management.map((m) => ({ role: m.role, name: nameById.get(m.user) || '—' }));

  const totalAssets = investments.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalFund = funds.reduce((s, f) => s + Number(f.collectedAmount || 0), 0);

  const collection = finance.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = finance.filter((t) => t.type === 'Expense').reduce((s, t) => s + Number(t.amount || 0), 0);

  res.json({
    units: unitsByStatus,
    residents: totalResidents,
    visitorsToday: totalVisitorsToday,
    staff: { security: securityStaffCount, housekeeping: housekeepingStaffCount },
    pets: { byType: petsByType, total: Object.values(petsByType).reduce((a, b) => a + b, 0) },
    vehicles: { byType: vehiclesByType, total: Object.values(vehiclesByType).reduce((a, b) => a + b, 0) },
    homeServices: { byType: homeServicesByType, total: Object.values(homeServicesByType).reduce((a, b) => a + b, 0) },
    complaints: {
      pending: pendingComplaintsByPriority,
      resolved: resolvedComplaintsByPriority,
      pendingTotal: Object.values(pendingComplaintsByPriority).reduce((a, b) => a + b, 0),
      resolvedTotal: Object.values(resolvedComplaintsByPriority).reduce((a, b) => a + b, 0),
    },
    meetings: upcomingMeetings,
    amenities,
    funds: { list: funds, totalCollected: totalFund },
    investments: { list: investments, totalAssets },
    management: managementList,
    leases: { expiringSoon: leasesExpiringSoon, total: pendingLeaseCount },
    finance: { collection, expense, balance: collection - expense },
  });
});

module.exports = { getOverview, getSecretaryOverview };
