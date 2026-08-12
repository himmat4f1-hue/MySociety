// Lightweight demo-data seeder used for GUEST SANDBOXES.
// Unlike utils/seed.js (which builds the full realistic "Greenfield Residency"
// demo society), this creates a smaller, generic dataset scoped to whatever
// societyId is passed in - used the moment someone clicks "Try as Guest".
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
const Policy = require('../models/Policy');
const Fund = require('../models/Fund');
const GatePass = require('../models/GatePass');
const Task = require('../models/Task');
const Supply = require('../models/Supply');
const provisionUnits = require('./provisionUnits');

const seedGuestSandbox = async (societyId, actorId) => {
  await provisionUnits(societyId, 2, 10); // 2 towers x 10 flats = quick sandbox

  const units = await Unit.find({ society: societyId }).limit(4);
  const flat1 = units[0]?.flatNo || 'A-101';
  const flat2 = units[1]?.flatNo || 'A-102';

  await Unit.updateMany({ society: societyId, flatNo: { $in: [flat1, flat2] } }, { status: 'Occupied' });

  await Visitor.create({ society: societyId, name: 'Sample Visitor', mobile: '9999900001', purpose: 'Personal Visit', flatNo: flat1, residentName: 'Demo Resident', status: 'Inside' });

  await Complaint.create({ society: societyId, title: 'Water Leakage in Bathroom (sample)', description: 'Sample complaint for demo purposes.', category: 'Plumbing', priority: 'High', status: 'Open', flatNo: flat1, raisedBy: actorId });

  await Maintenance.create({ society: societyId, title: 'Lift Not Working (sample)', description: 'Sample maintenance request for demo purposes.', category: 'Lift', priority: 'Medium', status: 'In Progress', flatNo: flat2, raisedBy: actorId });

  await Notice.insertMany([
    { society: societyId, title: 'Welcome to your Guest Sandbox', description: 'This is a temporary sandbox with sample data so you can explore every feature. It will auto-expire in a few days.', category: 'General', status: 'Published', createdBy: actorId },
    { society: societyId, title: 'Water Supply Interruption (sample)', description: 'Sample notice: water supply will be unavailable on Sunday for maintenance.', category: 'Maintenance', status: 'Published', createdBy: actorId },
  ]);

  await Amenity.insertMany([
    { society: societyId, name: 'Gym', type: 'Fitness', status: 'Available', availability: '6:00 AM - 10:00 PM' },
    { society: societyId, name: 'Swimming Pool', type: 'Recreation', status: 'Available', availability: '7:00 AM - 9:00 PM' },
    { society: societyId, name: 'Club House', type: 'Community', status: 'Available' },
  ]);

  await Document.insertMany([
    { society: societyId, name: 'Society By-Laws (sample)', category: 'Governance', type: 'Folder', isFolder: true },
    { society: societyId, name: 'Annual Budget (sample).pdf', category: 'Finance', type: 'PDF', sizeKB: 1800 },
  ]);

  await Invoice.insertMany([
    { society: societyId, invoiceNo: 'INV-DEMO-001', flatNo: flat1, residentName: 'Demo Resident', amount: 5000, dueDate: new Date(Date.now() + 15 * 86400000), status: 'Pending' },
    { society: societyId, invoiceNo: 'INV-DEMO-002', flatNo: flat2, residentName: 'Demo Resident', amount: 5000, dueDate: new Date(Date.now() - 5 * 86400000), status: 'Overdue' },
  ]);

  await Transaction.insertMany([
    { society: societyId, type: 'Income', category: 'Maintenance', description: 'Sample maintenance collection', amount: 5000, flatNo: flat1, status: 'Collected' },
    { society: societyId, type: 'Expense', category: 'Utilities', description: 'Sample electricity bill', amount: 8000, status: 'Paid' },
  ]);

  await Meeting.create({ society: societyId, title: 'Sample Annual General Meeting', type: 'General', date: new Date(Date.now() + 10 * 86400000), location: 'Conference Room', agenda: 'Sample agenda for demo purposes', createdBy: actorId });

  await Poll.create({ society: societyId, title: 'Sample Poll - Parking Rules', description: 'Sample poll for demo purposes', endDate: new Date(Date.now() + 7 * 86400000), votesYes: 5, votesNo: 1, totalEligible: 10, createdBy: actorId });

  await Policy.create({ society: societyId, title: 'Sample Visitor Management Policy', version: '1.0', publishedOn: new Date() });

  await Fund.create({ society: societyId, type: 'Required', title: 'Sample Lift Modernization Fund', targetAmount: 500000, collectedAmount: 150000, dueDate: new Date(Date.now() + 60 * 86400000) });

  await GatePass.create({ society: societyId, type: 'Vendor', name: 'Sample Delivery', flatNo: flat1, validTill: new Date(Date.now() + 3 * 3600000), status: 'Active' });

  await Task.insertMany([
    { society: societyId, title: 'Sweep Main Lobby (sample)', area: 'Main Lobby', frequency: 'Daily', priority: 'High', status: 'Pending' },
    { society: societyId, title: 'Clean Garden (sample)', area: 'Garden', frequency: 'Weekly', priority: 'Medium', status: 'In Progress' },
  ]);

  await Supply.insertMany([
    { society: societyId, itemName: 'Floor Cleaner (sample)', category: 'Cleaning', quantity: 10, unit: 'bottles', status: 'In Stock' },
    { society: societyId, itemName: 'Garbage Bags (sample)', category: 'Cleaning', quantity: 2, unit: 'packs', status: 'Low Stock' },
  ]);
};

module.exports = seedGuestSandbox;
