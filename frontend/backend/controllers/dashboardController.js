const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
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

// @desc  Get overview stats for the main dashboard (role-aware)
// @route GET /api/dashboard/overview
const getOverview = asyncHandler(async (req, res) => {
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
    Unit.countDocuments(),
    Unit.countDocuments({ status: 'Occupied' }),
    Unit.countDocuments({ status: 'Vacant' }),
    Unit.countDocuments({ status: 'Maintenance' }),
    User.countDocuments({ role: 'resident' }),
    Visitor.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    Visitor.countDocuments({ status: 'Inside' }),
    Complaint.countDocuments({ status: { $in: ['Open', 'Overdue'] } }),
    Maintenance.countDocuments({ status: { $in: ['Open', 'Overdue'] } }),
    Notice.countDocuments(),
    Notice.countDocuments({ status: 'Published' }),
    Amenity.countDocuments(),
    Amenity.countDocuments({ status: 'Available' }),
    Document.countDocuments(),
    Meeting.countDocuments({ date: { $gte: new Date() } }),
    Poll.countDocuments({ status: 'Active' }),
  ]);

  const collection = await Transaction.aggregate([
    { $match: { type: 'Income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const expense = await Transaction.aggregate([
    { $match: { type: 'Expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const outstanding = await Invoice.aggregate([
    { $match: { status: { $in: ['Pending', 'Overdue'] } } },
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
