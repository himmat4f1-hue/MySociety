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
const AgendaItem = require('../models/AgendaItem');
const FamilyMember = require('../models/FamilyMember');
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
//
// Accepts an optional ?date=YYYY-MM-DD query param ("Filter: By Date" on the
// dashboard). Only the cards that are meaningfully date-scoped respond to it:
//   - Visitors: count of visitors checked in on that specific day
//   - Upcoming Meetings: meetings on/after that date (instead of "today")
//   - Finance: collection/expense totals up to (and including) that date
// Everything else (unit occupancy, pets/vehicles/home-services breakdowns,
// complaints, staff counts, funds/assets, amenities, management list) is a
// structural snapshot of the society and is NOT date-scoped.
// @route GET /api/dashboard/secretary?date=YYYY-MM-DD
const getSecretaryOverview = asyncHandler(async (req, res) => {
  const sid = req.societyId;

  const requestedDate = req.query.date ? new Date(req.query.date) : new Date();
  const validDate = Number.isNaN(requestedDate.getTime()) ? new Date() : requestedDate;
  const startOfDay = new Date(validDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(validDate);
  endOfDay.setHours(23, 59, 59, 999);

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
    allUnits,
    petsByType,
    vehiclesByType,
    homeServicesByType,
    pendingComplaintsByPriority,
    resolvedComplaintsByPriority,
    upcomingMeetings,
    amenities,
    allFunds,
    investments,
    management,
    leasesExpiringSoon,
    pendingLeaseCount,
    financeRows,
    residentHeadcount,
    visitorsOnDate,
    securityStaffCount,
    housekeepingStaffCount,
    propertiesInSale,
  ] = await Promise.all([
    Unit.findAll({ where: { society: sid }, attributes: ['id', 'status', 'owner', 'resident'], raw: true }),
    countBy(Pet, 'type'),
    countBy(Vehicle, 'vehicleType'),
    countBy(HomeService, 'type'),
    countBy(Complaint, 'priority', { status: { [Op.in]: ['Open', 'In Process'] } }),
    countBy(Complaint, 'priority', { status: 'Resolved' }),
    Meeting.findAll({ where: { society: sid, date: { [Op.gte]: startOfDay } }, order: [['date', 'ASC']], limit: 8 }),
    Amenity.findAll({ where: { society: sid } }),
    Fund.findAll({ where: { society: sid } }),
    Investment.findAll({ where: { society: sid } }),
    Membership.findAll({ where: { society: sid, role: { [Op.notIn]: ['resident', 'tenant'] } } }),
    require('../models/Lease').count({ where: { society: sid, status: 'Expiring Soon' } }),
    require('../models/Lease').count({ where: { society: sid } }),
    Transaction.findAll({ where: { society: sid, date: { [Op.lte]: endOfDay } } }),
    FamilyMember.count({ where: { society: sid } }), // full headcount - owner/tenant families both included
    Visitor.count({ where: { society: sid, createdAt: { [Op.gte]: startOfDay, [Op.lte]: endOfDay } } }),
    Membership.count({ where: { society: sid, role: 'security', status: 'active' } }),
    Membership.count({ where: { society: sid, role: 'housekeeping', status: 'active' } }),
    Unit.count({ where: { society: sid, forSale: true } }),
  ]);

  // Owner-occupied vs Tenant-occupied vs Vacant, derived from each Unit's
  // owner/resident fields (NOT the Membership role, which doesn't reliably
  // distinguish this) - see backend/routes/unitRoutes.js for how a flat's
  // owner/resident get set.
  const unitsByOccupancy = { Owner: 0, Tenant: 0, Vacant: 0 };
  allUnits.forEach((u) => {
    if (u.status === 'Vacant' || (!u.owner && !u.resident)) {
      unitsByOccupancy.Vacant += 1;
    } else if (u.owner && u.resident && u.owner === u.resident) {
      unitsByOccupancy.Owner += 1;
    } else {
      unitsByOccupancy.Tenant += 1;
    }
  });

  // Add a computed "available" (capacity - used) to each amenity for the
  // dashboard's Capacity/Used/Available columns.
  const amenitiesWithAvailability = amenities.map((a) => {
    const json = a.toJSON();
    return { ...json, available: Math.max((json.capacity || 0) - (json.used || 0), 0) };
  });

  // Attach an agenda-item count to each upcoming meeting (for the "No. of
  // Agendas" column on the dashboard).
  const meetingIds = upcomingMeetings.map((m) => m.id);
  const agendaCounts = meetingIds.length
    ? await AgendaItem.findAll({
        where: { meeting: { [Op.in]: meetingIds } },
        attributes: ['meeting', [AgendaItem.sequelize.fn('COUNT', AgendaItem.sequelize.col('id')), 'count']],
        group: ['meeting'],
        raw: true,
      })
    : [];
  const agendaCountByMeeting = new Map(agendaCounts.map((r) => [r.meeting, parseInt(r.count, 10)]));
  const meetingsWithAgendaCount = upcomingMeetings.map((m) => ({ ...m.toJSON(), agendaCount: agendaCountByMeeting.get(m.id) || 0 }));

  const managementUserIds = [...new Set(management.map((m) => m.user))];
  const managementUsers = await User.findAll({ where: { id: { [Op.in]: managementUserIds } }, attributes: ['id', 'name'] });
  const nameById = new Map(managementUsers.map((u) => [u.id, u.name]));
  const managementList = management.map((m) => ({ role: m.role, name: nameById.get(m.user) || '—' }));

  // "Society Fund" (required funds like corpus/maintenance/sinking) vs
  // "Celebration/Donation" (festival/event collections) are shown as two
  // separate cards, mirroring how Funds are actually categorized (type field).
  const requiredFunds = allFunds.filter((f) => f.type === 'Required');
  const celebrationFunds = allFunds.filter((f) => f.type === 'Celebration');
  const totalFund = requiredFunds.reduce((s, f) => s + Number(f.collectedAmount || 0), 0);
  const celebrationCollection = celebrationFunds.reduce((s, f) => s + Number(f.collectedAmount || 0), 0);
  const celebrationExpense = celebrationFunds.reduce((s, f) => s + Number(f.expenseAmount || 0), 0);

  const assetsList = investments.filter((i) => i.kind === 'Asset');
  const investmentsList = investments.filter((i) => i.kind === 'Investment');
  const totalAssets = assetsList.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalInvestments = investmentsList.reduce((s, i) => s + Number(i.amount || 0), 0);

  const collection = financeRows.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = financeRows.filter((t) => t.type === 'Expense').reduce((s, t) => s + Number(t.amount || 0), 0);

  res.json({
    date: startOfDay.toISOString().slice(0, 10),
    units: unitsByOccupancy,
    totalUnits: allUnits.length,
    residents: residentHeadcount,
    visitorsToday: visitorsOnDate,
    staff: { security: securityStaffCount, housekeeping: housekeepingStaffCount },
    propertiesInSale,
    pets: { byType: petsByType, total: Object.values(petsByType).reduce((a, b) => a + b, 0) },
    vehicles: { byType: vehiclesByType, total: Object.values(vehiclesByType).reduce((a, b) => a + b, 0) },
    homeServices: { byType: homeServicesByType, total: Object.values(homeServicesByType).reduce((a, b) => a + b, 0) },
    complaints: {
      pending: pendingComplaintsByPriority,
      resolved: resolvedComplaintsByPriority,
      pendingTotal: Object.values(pendingComplaintsByPriority).reduce((a, b) => a + b, 0),
      resolvedTotal: Object.values(resolvedComplaintsByPriority).reduce((a, b) => a + b, 0),
    },
    meetings: meetingsWithAgendaCount,
    amenities: amenitiesWithAvailability,
    funds: { list: requiredFunds, totalCollected: totalFund },
    celebration: { list: celebrationFunds, collection: celebrationCollection, expense: celebrationExpense, balance: celebrationCollection - celebrationExpense },
    investments: { list: investmentsList, assetsList, totalAssets, totalInvestments },
    management: managementList,
    leases: { expiringSoon: leasesExpiringSoon, total: pendingLeaseCount },
    finance: { collection, expense, balance: collection - expense },
  });
});

module.exports = { getOverview, getSecretaryOverview };
