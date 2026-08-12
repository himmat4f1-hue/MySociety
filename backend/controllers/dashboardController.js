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

// @desc  Get overview stats for the main dashboard (role-aware), scoped to the
// current society only (req.societyId comes from the JWT via auth middleware).
// @route GET /api/dashboard/overview
const getOverview = asyncHandler(async (req, res) => {
  const sid = req.societyId;

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
  ] = await Promise.all([
    Unit.countDocuments({ society: sid }),
    Unit.countDocuments({ society: sid, status: 'Occupied' }),
    Unit.countDocuments({ society: sid, status: 'Vacant' }),
    Unit.countDocuments({ society: sid, status: 'Maintenance' }),
    Membership.countDocuments({ society: sid, role: { $in: ['resident', 'tenant'] } }),
    Visitor.countDocuments({
      society: sid,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    Visitor.countDocuments({ society: sid, status: 'Inside' }),
    Complaint.countDocuments({ society: sid, status: { $in: ['Open', 'Overdue'] } }),
    Maintenance.countDocuments({ society: sid, status: { $in: ['Open', 'Overdue'] } }),
    Notice.countDocuments({ society: sid }),
    Notice.countDocuments({ society: sid, status: 'Published' }),
    Amenity.countDocuments({ society: sid }),
    Amenity.countDocuments({ society: sid, status: 'Available' }),
    Document.countDocuments({ society: sid }),
    Meeting.countDocuments({ society: sid, date: { $gte: new Date() } }),
    Poll.countDocuments({ society: sid, status: 'Active' }),
  ]);

  const collection = await Transaction.aggregate([
    { $match: { society: sid, type: 'Income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const expense = await Transaction.aggregate([
    { $match: { society: sid, type: 'Expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const outstanding = await Invoice.aggregate([
    { $match: { society: sid, status: { $in: ['Pending', 'Overdue'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
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
      collection: collection[0]?.total || 0,
      expense: expense[0]?.total || 0,
      outstanding: outstanding[0]?.total || 0,
    },
  });
});

module.exports = { getOverview };
