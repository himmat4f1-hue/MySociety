// Run with: npm run seed
// Also callable programmatically (see routes/devRoutes.js -> POST /api/dev/seed)
// so it can be triggered from a button in the app without needing shell/SSH
// access to the deployed backend (Render's free plan doesn't include Shell).
//
// Wipes existing data and inserts demo data matching the Greenfield Residency mockups.
// Also sets up the Plans catalog and the "Greenfield Residency" demo Society so all
// the existing demo login accounts continue to work exactly as before, just now
// scoped inside a proper multi-tenant Society + Membership structure.
require('dotenv').config();

const User = require('../models/User');
const Society = require('../models/Society');
const Plan = require('../models/Plan');
const Membership = require('../models/Membership');
const provisionUnits = require('./provisionUnits');
const Unit = require('../models/Unit');
const Building = require('../models/Building');
const Resident = require('../models/Resident');
const Pet = require('../models/Pet');
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
const Emergency = require('../models/Emergency');
const CameraRequest = require('../models/CameraRequest');
const Policy = require('../models/Policy');
const Investment = require('../models/Investment');
const Fund = require('../models/Fund');
const GatePass = require('../models/GatePass');
const Shift = require('../models/Shift');
const Task = require('../models/Task');
const Supply = require('../models/Supply');
const Lease = require('../models/Lease');
const FlatOwner = require('../models/FlatOwner');
const FamilyMember = require('../models/FamilyMember');
const Vehicle = require('../models/Vehicle');
const HomeService = require('../models/HomeService');
const RoleChecklist = require('../models/RoleChecklist');
const AgendaItem = require('../models/AgendaItem');
const MeetingAttendance = require('../models/MeetingAttendance');
const CommitteeVote = require('../models/CommitteeVote');
const ManagementVote = require('../models/ManagementVote');

// Core seeding logic. Assumes the database is already connected (does NOT
// call connectDB() or process.exit() itself) so it's safe to call from a
// running server (the /api/dev/seed route) as well as from the CLI wrapper
// at the bottom of this file.
const runSeed = async () => {
  console.log('Clearing existing data...');
  await Promise.all([
    User.destroy({ where: {}, truncate: true, cascade: true }),
    Society.destroy({ where: {}, truncate: true, cascade: true }),
    Plan.destroy({ where: {}, truncate: true, cascade: true }),
    Membership.destroy({ where: {}, truncate: true, cascade: true }),
    Unit.destroy({ where: {}, truncate: true, cascade: true }),
    Building.destroy({ where: {}, truncate: true, cascade: true }),
    Resident.destroy({ where: {}, truncate: true, cascade: true }),
    Pet.destroy({ where: {}, truncate: true, cascade: true }),
    Visitor.destroy({ where: {}, truncate: true, cascade: true }),
    Complaint.destroy({ where: {}, truncate: true, cascade: true }),
    Maintenance.destroy({ where: {}, truncate: true, cascade: true }),
    Notice.destroy({ where: {}, truncate: true, cascade: true }),
    Amenity.destroy({ where: {}, truncate: true, cascade: true }),
    Document.destroy({ where: {}, truncate: true, cascade: true }),
    Invoice.destroy({ where: {}, truncate: true, cascade: true }),
    Transaction.destroy({ where: {}, truncate: true, cascade: true }),
    Meeting.destroy({ where: {}, truncate: true, cascade: true }),
    Poll.destroy({ where: {}, truncate: true, cascade: true }),
    Emergency.destroy({ where: {}, truncate: true, cascade: true }),
    CameraRequest.destroy({ where: {}, truncate: true, cascade: true }),
    Policy.destroy({ where: {}, truncate: true, cascade: true }),
    Investment.destroy({ where: {}, truncate: true, cascade: true }),
    Fund.destroy({ where: {}, truncate: true, cascade: true }),
    GatePass.destroy({ where: {}, truncate: true, cascade: true }),
    Shift.destroy({ where: {}, truncate: true, cascade: true }),
    Task.destroy({ where: {}, truncate: true, cascade: true }),
    Supply.destroy({ where: {}, truncate: true, cascade: true }),
    Lease.destroy({ where: {}, truncate: true, cascade: true }),
    FlatOwner.destroy({ where: {}, truncate: true, cascade: true }),
    FamilyMember.destroy({ where: {}, truncate: true, cascade: true }),
    Vehicle.destroy({ where: {}, truncate: true, cascade: true }),
    HomeService.destroy({ where: {}, truncate: true, cascade: true }),
    RoleChecklist.destroy({ where: {}, truncate: true, cascade: true }),
    AgendaItem.destroy({ where: {}, truncate: true, cascade: true }),
    MeetingAttendance.destroy({ where: {}, truncate: true, cascade: true }),
    CommitteeVote.destroy({ where: {}, truncate: true, cascade: true }),
    ManagementVote.destroy({ where: {}, truncate: true, cascade: true }),
  ]);

  console.log('Creating subscription plans...');
  await Plan.bulkCreate([
    { name: 'Basic', slug: 'basic', pricePerFlatPerMonth: 5, minFlats: 1, maxFlats: 50, features: ['Visitor & Gate Management', 'Complaints & Maintenance', 'Notice Board', 'Amenities Booking'], isActive: true },
    { name: 'Standard', slug: 'standard', pricePerFlatPerMonth: 8, minFlats: 1, maxFlats: 300, features: ['Everything in Basic', 'Finance & Invoicing', 'Meetings & Voting', 'Documents & Policies'], isPopular: true, isActive: true },
    { name: 'Premium', slug: 'premium', pricePerFlatPerMonth: 12, minFlats: 1, maxFlats: 0, features: ['Everything in Standard', 'Investments & Funds', 'Staff Shifts & Tasks', 'Gate Passes & Lease Management', 'Priority Support'], isActive: true },
  ]);

  console.log('Creating demo society (Greenfield Residency)...');
  const demoSociety = await Society.create({
    name: 'Greenfield Residency',
    slug: 'greenfield-residency',
    city: 'Mumbai',
    buildingsCount: 4,
    totalFlats: 60,
    status: 'Active',
  });
  const sid = demoSociety.id;

  console.log('Creating users (one per role, password: 123456 for all) + memberships...');
  const password = '123456';

  const makeUserAndMembership = async ({ name, email, role, phone, flatNo, tower, residentType }) => {
    const user = await User.create({ name, email, password, role, phone, flatNo, tower, residentType });
    await Membership.create({ user: user.id, society: sid, role, flatNo: flatNo || null, tower: tower || null, flatId: flatNo || null });
    return user;
  };

  const security = await makeUserAndMembership({ name: 'Ramesh Kumar', email: 'security@mysociety.com', role: 'security', phone: '9876500001' });
  const accountant = await makeUserAndMembership({ name: 'Ankit Mehta', email: 'accountant@mysociety.com', role: 'accountant', phone: '9876500002' });
  const secretary = await makeUserAndMembership({ name: 'Sunita Iyer', email: 'secretary@mysociety.com', role: 'secretary', phone: '9876500003' });
  const chairman = await makeUserAndMembership({ name: 'Rajesh Malhotra', email: 'chairman@mysociety.com', role: 'chairman', phone: '9876500004' });
  const treasurer = await makeUserAndMembership({ name: 'Vivek Sharma', email: 'treasurer@mysociety.com', role: 'treasurer', phone: '9876500005' });
  const committee = await makeUserAndMembership({ name: 'Anita Kapoor', email: 'committee@mysociety.com', role: 'committee_member', phone: '9876500006' });
  const housekeeping = await makeUserAndMembership({ name: 'Suresh Yadav', email: 'housekeeping@mysociety.com', role: 'housekeeping', phone: '9876500007' });

  const rahul = await makeUserAndMembership({ name: 'Rahul Sharma', email: 'rahul@mysociety.com', role: 'resident', residentType: 'owner', flatNo: 'A-101', tower: 'Tower A', phone: '9876543210' });
  const priya = await makeUserAndMembership({ name: 'Priya Patel', email: 'priya@mysociety.com', role: 'resident', residentType: 'owner', flatNo: 'A-102', tower: 'Tower A', phone: '9876543211' });
  const amit = await makeUserAndMembership({ name: 'Amit Verma', email: 'amit@mysociety.com', role: 'resident', residentType: 'tenant', flatNo: 'B-201', tower: 'Tower B', phone: '9876543212' });
  const neha = await makeUserAndMembership({ name: 'Neha Singh', email: 'neha@mysociety.com', role: 'resident', residentType: 'owner', flatNo: 'B-202', tower: 'Tower B', phone: '9876543213' });
  const vikram = await makeUserAndMembership({ name: 'Vikram Joshi', email: 'vikram@mysociety.com', role: 'resident', residentType: 'tenant', flatNo: 'C-301', tower: 'Tower C', phone: '9876543214' });
  const meera = await makeUserAndMembership({ name: 'Meera Nair', email: 'tenant@mysociety.com', role: 'tenant', residentType: 'tenant', flatNo: 'D-401', tower: 'Tower D', phone: '9876543217' });

  console.log('Creating units (60 flats across 4 towers)...');
  const towers = ['Tower A', 'Tower B', 'Tower C', 'Tower D'];
  const types = ['2 BHK', '3 BHK', '2 BHK', '4 BHK'];
  const unitDocs = [];
  let counter = 0;
  for (const tower of towers) {
    const prefix = tower.split(' ')[1];
    for (let floor = 1; floor <= 5; floor++) {
      for (let u = 1; u <= 3; u++) {
        counter++;
        const flatNo = `${prefix}-${floor}0${u}`;
        unitDocs.push({
          society: sid,
          flatNo,
          tower,
          floor: `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`,
          type: types[counter % types.length],
          areaSqft: 1000 + (counter % 5) * 150,
          status: counter % 7 === 0 ? 'Vacant' : counter % 11 === 0 ? 'Maintenance' : 'Occupied',
        });
      }
    }
  }
  await Unit.bulkCreate(unitDocs);
  await Building.bulkCreate(towers.map((t) => ({ society: sid, name: t })));

  await Unit.update({ owner: rahul.id, resident: rahul.id, status: 'Occupied' }, { where: { society: sid, flatNo: 'A-101' } });
  await Unit.update({ owner: priya.id, resident: priya.id, status: 'Occupied' }, { where: { society: sid, flatNo: 'A-102' } });
  await Unit.update({ resident: amit.id, status: 'Occupied' }, { where: { society: sid, flatNo: 'B-201' } });
  await Unit.update({ owner: neha.id, resident: neha.id, status: 'Occupied' }, { where: { society: sid, flatNo: 'B-202' } });
  await Unit.update({ resident: vikram.id, status: 'Occupied' }, { where: { society: sid, flatNo: 'C-301' } });
  await Unit.update({ resident: meera.id, status: 'Occupied' }, { where: { society: sid, flatNo: 'D-401' } });
  // Rahul (A-101 owner) also owns D-402, AND also serves as Secretary in this same
  // society - this is the exact multi-role, multi-flat scenario the login flow
  // (Society -> Role -> Flat) is designed for. Log in as rahul@mysociety.com to see it.
  await Unit.update({ owner: rahul.id, status: 'Occupied' }, { where: { society: sid, flatNo: 'D-402' } });
  await Membership.create({ user: rahul.id, society: sid, role: 'resident', flatNo: 'D-402', tower: 'Tower D', flatId: 'D-402' });
  await Membership.create({ user: rahul.id, society: sid, role: 'secretary' });

  console.log('Creating resident profiles...');
  await Resident.bulkCreate([
    { society: sid, user: rahul.id, flatNo: 'A-101', tower: 'Tower A', type: 'Owner', vehicles: [{ type: 'Car', number: 'MH02 AB 1234' }] },
    { society: sid, user: priya.id, flatNo: 'A-102', tower: 'Tower A', type: 'Owner' },
    { society: sid, user: amit.id, flatNo: 'B-201', tower: 'Tower B', type: 'Tenant' },
    { society: sid, user: neha.id, flatNo: 'B-202', tower: 'Tower B', type: 'Owner' },
    { society: sid, user: vikram.id, flatNo: 'C-301', tower: 'Tower C', type: 'Tenant' },
    { society: sid, user: meera.id, flatNo: 'D-401', tower: 'Tower D', type: 'Tenant' },
  ]);

  console.log('Creating pets...');
  await Pet.bulkCreate([
    { society: sid, name: 'Bruno', type: 'Dog', breed: 'Labrador', flatId: 'A-101', vaccinated: true },
    { society: sid, name: 'Whiskers', type: 'Cat', breed: 'Persian', flatId: 'B-202', vaccinated: true },
  ]);

  console.log('Creating visitors (spread across recent days, so the dashboard date filter has something to show)...');
  await Visitor.bulkCreate([
    { society: sid, name: 'Sandeep Kumar', mobile: '9876543210', purpose: 'Personal Visit', flatNo: 'A-101', residentName: 'Rahul Sharma', status: 'Inside', createdAt: new Date() },
    { society: sid, name: 'Priya Mehta', mobile: '9876543211', purpose: 'Courier Delivery', flatNo: 'A-102', residentName: 'Priya Patel', status: 'Checked Out', outTime: new Date(), createdAt: new Date() },
    { society: sid, name: 'Vijay Singh', mobile: '9876543212', purpose: 'Service Person', flatNo: 'B-201', residentName: 'Amit Verma', status: 'Checked Out', outTime: new Date(Date.now() - 2 * 86400000), createdAt: new Date(Date.now() - 2 * 86400000) },
    { society: sid, name: 'Rohit Sharma', mobile: '9876543213', purpose: 'Personal Visit', flatNo: 'B-202', residentName: 'Neha Singh', status: 'Inside', createdAt: new Date(Date.now() - 5 * 86400000) },
  ]);

  console.log('Creating complaints...');
  await Complaint.bulkCreate([
    { society: sid, title: 'Water Leakage in Bathroom', description: 'Water is leaking from the tap in bathroom.', category: 'Plumbing', priority: 'High', status: 'Open', flatNo: 'A-101', raisedBy: rahul.id },
    { society: sid, title: 'Lift Not Working', description: 'Lift of Tower A is not working since morning.', category: 'Lift', priority: 'High', status: 'In Process', flatNo: 'A-102', raisedBy: priya.id },
    { society: sid, title: 'Street Light Not Working', description: 'Street light near gate is not working.', category: 'Electrical', priority: 'Medium', status: 'In Process', flatNo: 'B-201', raisedBy: amit.id },
    { society: sid, title: 'Garbage Not Collected', description: 'Garbage not collected from our floor.', category: 'Housekeeping', priority: 'Low', status: 'Resolved', flatNo: 'B-202', raisedBy: neha.id, resolvedOn: new Date() },
  ]);

  console.log('Creating maintenance requests...');
  await Maintenance.bulkCreate([
    { society: sid, title: 'Water Leakage in Bathroom', description: 'Water is leaking from the tap.', category: 'Plumbing', priority: 'High', status: 'Open', flatNo: 'A-101', raisedBy: rahul.id },
    { society: sid, title: 'Lift Not Working', description: 'Lift is not working since morning.', category: 'Lift', priority: 'High', status: 'In Progress', flatNo: 'A-102', raisedBy: priya.id },
    { society: sid, title: 'AC Outdoor Unit Noise', description: 'AC is making a loud noise.', category: 'AC/HVAC', priority: 'Low', status: 'Completed', flatNo: 'B-202', raisedBy: neha.id, completedOn: new Date() },
  ]);

  console.log('Creating notices...');
  await Notice.bulkCreate([
    { society: sid, title: 'Annual Maintenance Charges Due', description: 'This is a reminder that annual maintenance charges for FY 2024-25 are due by 31st May 2024.', category: 'Finance', status: 'Published', createdBy: secretary.id },
    { society: sid, title: 'Water Supply Interruption', description: 'Water supply will be unavailable on Sunday from 10:00 PM to 6:00 AM due to pipeline maintenance.', category: 'Maintenance', building: 'Tower A, Tower B', status: 'Published', createdBy: secretary.id },
    { society: sid, title: 'Community Meeting', description: 'All residents are requested to attend the community meeting on 18th May 2024 at 6:00 PM in the clubhouse.', category: 'Community', status: 'Published', createdBy: secretary.id },
    { society: sid, title: 'New Parking Rules', description: 'Please follow the updated parking guidelines effective from 20th May 2024.', category: 'Rules & Regulations', status: 'Scheduled', scheduledDate: new Date(Date.now() + 7 * 86400000), createdBy: secretary.id },
  ]);

  console.log('Creating amenities...');
  await Amenity.bulkCreate([
    { society: sid, name: 'Gym', type: 'Fitness', building: 'Tower A', status: 'Available', availability: '6:00 AM - 10:00 PM' },
    { society: sid, name: 'Swimming Pool', type: 'Recreation', building: 'Tower B', status: 'Available', availability: '7:00 AM - 9:00 PM' },
    { society: sid, name: 'Club House', type: 'Community', building: 'All Towers', status: 'Available', availability: '8:00 AM - 11:00 PM' },
    { society: sid, name: 'Tennis Court', type: 'Sports', building: 'Tower C', status: 'Under Maintenance' },
    { society: sid, name: 'Children Play Area', type: 'Recreation', building: 'Tower A', status: 'Available', availability: '6:00 AM - 9:00 PM' },
    { society: sid, name: 'Power Backup', type: 'Utility', building: 'All Towers', status: 'Out of Service' },
  ]);

  console.log('Creating documents...');
  await Document.bulkCreate([
    { society: sid, name: 'Society By-Laws', category: 'Governance', type: 'Folder', isFolder: true },
    { society: sid, name: 'Annual Budget 2024-25.pdf', category: 'Finance', type: 'PDF', sizeKB: 2400 },
    { society: sid, name: 'Maintenance Charges.xlsx', category: 'Finance', type: 'Excel', sizeKB: 1100 },
    { society: sid, name: 'General Meeting Minutes.docx', category: 'Governance', type: 'Word', sizeKB: 850, isFavorite: true },
    { society: sid, name: 'Fire Safety Guidelines.pdf', category: 'Safety', type: 'PDF', sizeKB: 1800 },
  ]);

  console.log('Creating invoices...');
  await Invoice.bulkCreate([
    { society: sid, invoiceNo: 'INV-2024-05-001', flatNo: 'A-1303', residentName: 'Neha Singh', amount: 5250, dueDate: new Date('2024-05-20'), status: 'Paid' },
    { society: sid, invoiceNo: 'INV-2024-05-102', flatNo: 'B-402', residentName: 'Amit Verma', amount: 5250, dueDate: new Date('2024-05-18'), status: 'Pending' },
    { society: sid, invoiceNo: 'INV-2024-05-103', flatNo: 'C-1101', residentName: 'Vikram Joshi', amount: 5200, dueDate: new Date('2024-05-10'), status: 'Overdue' },
    { society: sid, invoiceNo: 'INV-2024-06-104', flatNo: 'A-101', residentName: 'Rahul Sharma', amount: 5250, dueDate: new Date('2024-06-20'), status: 'Pending' },
    { society: sid, invoiceNo: 'INV-2024-06-105', flatNo: 'D-401', residentName: 'Meera Nair', amount: 4800, dueDate: new Date('2024-06-15'), status: 'Pending' },
    { society: sid, invoiceNo: 'INV-2024-06-106', flatNo: 'D-402', residentName: 'Rahul Sharma', amount: 4900, dueDate: new Date('2024-06-25'), status: 'Pending' },
  ]);

  console.log('Creating transactions (spread across recent days, so the dashboard date filter has something to show)...');
  await Transaction.bulkCreate([
    { society: sid, type: 'Income', category: 'Maintenance', description: 'Maintenance Bill - May', amount: 5250, flatNo: 'A-101', status: 'Collected', date: new Date() },
    { society: sid, type: 'Expense', category: 'Utilities', description: 'Electricity Bill Payment', amount: 18600, flatNo: 'B-201', status: 'Paid', date: new Date(Date.now() - 3 * 86400000) },
    { society: sid, type: 'Income', category: 'Maintenance', description: 'Water Bill Collection', amount: 12000, flatNo: 'C-301', status: 'Collected', date: new Date(Date.now() - 7 * 86400000) },
    { society: sid, type: 'Expense', category: 'Others', description: 'Gardening Expense', amount: 4500, status: 'Paid', date: new Date(Date.now() - 10 * 86400000) },
  ]);

  console.log('Creating meetings (relative to today, so "Upcoming Meetings" always has something to show)...');
  await Meeting.bulkCreate([
    { society: sid, title: 'Annual General Meeting', type: 'General', date: new Date(Date.now() + 5 * 86400000), location: 'Conference Room', agenda: 'Financial approval and by-law amendment discussion', createdBy: secretary.id },
    { society: sid, title: 'Executive Committee Meeting', type: 'Committee', date: new Date(Date.now() + 10 * 86400000), location: 'Committee Room', createdBy: secretary.id },
    { society: sid, title: 'Building Maintenance Meeting', type: 'Internal', date: new Date(Date.now() + 20 * 86400000), location: 'Tower A Meeting Room', createdBy: secretary.id },
    { society: sid, title: 'Diwali Celebration Planning', type: 'Community', date: new Date(Date.now() + 35 * 86400000), location: 'Community Hall', createdBy: secretary.id },
  ]);

  console.log('Creating polls...');
  await Poll.bulkCreate([
    { society: sid, title: 'By-Law Amendment', description: 'Proposed changes to society by-laws', endDate: new Date(Date.now() + 14 * 86400000), votesYes: 45, votesNo: 8, totalEligible: 60, createdBy: chairman.id },
    { society: sid, title: 'Parking Rules Amendment', description: 'New guidelines for visitor parking', endDate: new Date(Date.now() + 3 * 86400000), votesYes: 30, votesNo: 12, totalEligible: 60, createdBy: chairman.id },
  ]);

  console.log('Creating emergencies, camera requests, policies, investments, funds...');
  await Emergency.create({ society: sid, type: 'Security', flatNo: 'A-101', raisedBy: rahul.id, notes: 'Unauthorized vehicle spotted', status: 'Resolved' });
  await CameraRequest.create({ society: sid, area: 'Main Gate', date: new Date('2024-05-17'), time: '08:30', reason: 'Bike scratch incident in parking.', flatNo: 'A-101', requestedBy: rahul.id, status: 'Pending' });

  await Policy.bulkCreate([
    { society: sid, title: 'Visitor Management Policy', version: '2.1', publishedOn: new Date('2024-01-12') },
    { society: sid, title: 'Parking Policy', version: '1.3', publishedOn: new Date('2023-10-05') },
    { society: sid, title: 'Maintenance Policy', version: '2.0', publishedOn: new Date('2023-01-01') },
    { society: sid, title: 'Pet Policy', version: '1.1', publishedOn: new Date('2023-03-10') },
  ]);

  await Investment.bulkCreate([
    { society: sid, kind: 'Investment', name: 'Fixed Deposit - HDFC', amount: 250000, maturityDate: new Date('2024-12-15') },
    { society: sid, kind: 'Investment', name: 'Fixed Deposit - ICICI', amount: 150000, maturityDate: new Date('2024-08-10') },
    { society: sid, kind: 'Investment', name: 'Mutual Fund - SBI', amount: 100000 },
  ]);

  await Fund.bulkCreate([
    { society: sid, type: 'Required', title: 'Lift Modernization Project', targetAmount: 1200000, collectedAmount: 600000, dueDate: new Date('2024-06-30') },
    { society: sid, type: 'Required', title: 'Painting Work - Phase 2', targetAmount: 650000, collectedAmount: 200000, dueDate: new Date('2024-07-15') },
    { society: sid, type: 'Celebration', title: 'Diwali Celebration 2024', collectedAmount: 150000, expenseAmount: 120000 },
  ]);

  console.log('Creating gate passes, shifts, tasks, supplies, leases...');
  await GatePass.bulkCreate([
    { society: sid, type: 'Vendor', name: 'Swiggy Delivery', mobile: '9998887771', flatNo: 'A-101', validTill: new Date(Date.now() + 2 * 3600000), status: 'Active' },
    { society: sid, type: 'Vehicle', name: 'Amit Verma Car', vehicleNumber: 'MH02 CD 5678', flatNo: 'B-201', validTill: new Date(Date.now() + 30 * 86400000), status: 'Active' },
    { society: sid, type: 'Service Staff', name: 'Ramesh (Plumber)', mobile: '9998887772', flatNo: 'C-301', validTill: new Date(Date.now() - 86400000), status: 'Expired' },
  ]);

  await Shift.bulkCreate([
    { society: sid, staffName: 'Ramesh Kumar', role: 'Security', shiftType: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM', status: 'Present' },
    { society: sid, staffName: 'Suresh Yadav', role: 'Housekeeping', shiftType: 'Morning', startTime: '07:00 AM', endTime: '03:00 PM', status: 'Present' },
    { society: sid, staffName: 'Night Guard', role: 'Security', shiftType: 'Night', startTime: '10:00 PM', endTime: '06:00 AM', status: 'Scheduled' },
  ]);

  await Task.bulkCreate([
    { society: sid, title: 'Sweep & Mop Main Lobby', area: 'Main Lobby', assignedTo: 'Suresh Yadav', frequency: 'Daily', priority: 'High', status: 'Completed' },
    { society: sid, title: 'Clean Club House Windows', area: 'Club House', assignedTo: 'Suresh Yadav', frequency: 'Weekly', priority: 'Medium', status: 'Pending' },
    { society: sid, title: 'Garden Trimming', area: 'Garden', assignedTo: 'Suresh Yadav', frequency: 'Weekly', priority: 'Low', status: 'In Progress' },
    { society: sid, title: 'Garbage Collection - Tower A', area: 'Tower A', assignedTo: 'Suresh Yadav', frequency: 'Daily', priority: 'High', status: 'Pending' },
  ]);

  await Supply.bulkCreate([
    { society: sid, itemName: 'Floor Cleaner', category: 'Cleaning', quantity: 12, unit: 'bottles', status: 'In Stock' },
    { society: sid, itemName: 'Garbage Bags', category: 'Cleaning', quantity: 5, unit: 'packs', status: 'Low Stock' },
    { society: sid, itemName: 'Hand Gloves', category: 'Safety', quantity: 0, unit: 'boxes', status: 'Out of Stock' },
    { society: sid, itemName: 'Mop Set', category: 'Equipment', quantity: 8, unit: 'pcs', status: 'In Stock' },
  ]);

  await Lease.bulkCreate([
    { society: sid, flatNo: 'B-201', tower: 'Tower B', tenantName: 'Amit Verma', ownerName: 'Owner (B-201)', leaseStart: new Date('2024-01-01'), leaseEnd: new Date('2024-12-31'), monthlyRent: 25000, securityDeposit: 75000, status: 'Active' },
    { society: sid, flatNo: 'C-301', tower: 'Tower C', tenantName: 'Vikram Joshi', ownerName: 'Owner (C-301)', leaseStart: new Date('2023-09-01'), leaseEnd: new Date('2024-08-31'), monthlyRent: 22000, securityDeposit: 66000, status: 'Expiring Soon' },
    { society: sid, flatNo: 'D-401', tower: 'Tower D', tenantName: 'Meera Nair', ownerName: 'Owner (D-401)', leaseStart: new Date('2024-03-01'), leaseEnd: new Date('2025-02-28'), monthlyRent: 20000, securityDeposit: 60000, status: 'Active' },
  ]);

  console.log('Creating Personal Data (Flat Owners) + auto-added Family Data...');
  const flatOwnerDefs = [
    { flatId: 'A-101', building: 'A', flatNo: '101', ownerNo: 1, firstName: 'Rahul', lastName: 'Sharma', gender: 'Male', mobileNumber: '9876543210', user: rahul.id },
    { flatId: 'A-102', building: 'A', flatNo: '102', ownerNo: 1, firstName: 'Priya', lastName: 'Patel', gender: 'Female', mobileNumber: '9876543211', user: priya.id },
    { flatId: 'B-202', building: 'B', flatNo: '202', ownerNo: 1, firstName: 'Neha', lastName: 'Singh', gender: 'Female', mobileNumber: '9876543213', user: neha.id },
  ];
  for (const def of flatOwnerDefs) {
    const owner = await FlatOwner.create({ society: sid, ...def });
    await FamilyMember.create({
      society: sid,
      flatId: owner.flatId,
      firstName: owner.firstName,
      lastName: owner.lastName,
      gender: owner.gender,
      mobileNumber: owner.mobileNumber,
      isAutoAddedOwner: true,
    });
  }
  // Extra family members added by owners themselves
  await FamilyMember.bulkCreate([
    { society: sid, flatId: 'A-101', firstName: 'Anjali', lastName: 'Sharma', gender: 'Female', mobileNumber: '9876543299' },
    { society: sid, flatId: 'A-101', firstName: 'Arjun', lastName: 'Sharma', gender: 'Male', birthDate: new Date('2015-04-12') },
  ]);

  console.log('Creating vehicles...');
  await Vehicle.bulkCreate([
    { society: sid, flatId: 'A-101', vehicleType: 'Car', fuelType: 'Petrol', color: 'White', registrationNo: 'MH02 AB 1234' },
    { society: sid, flatId: 'B-202', vehicleType: 'Bike', fuelType: 'Petrol', color: 'Black', registrationNo: 'MH02 XY 9876' },
  ]);

  console.log('Creating home services...');
  await HomeService.bulkCreate([
    { society: sid, flatId: 'A-101', type: 'House Maid', firstName: 'Kamla', lastName: 'Devi', gender: 'Female', mobileNumber: '9998887766', inTime: '9:00 AM', outTime: '11:00 AM' },
    { society: sid, flatId: 'A-101', type: 'Milk Supplier', firstName: 'Ramu', lastName: '', gender: 'Male', inTime: '6:30 AM', outTime: '6:45 AM' },
  ]);

  console.log('Creating role checklist...');
  await RoleChecklist.bulkCreate([
    { society: sid, role: 'Chairman', responsibilities: 'Overall governance, chairs meetings, final decision-making authority, represents the society externally.' },
    { society: sid, role: 'Secretary', responsibilities: 'Manages day-to-day administration, maintains records, issues notices, coordinates meetings and agenda.' },
    { society: sid, role: 'Accountant', responsibilities: 'Maintains financial records, invoices, receipts, prepares financial reports.' },
    { society: sid, role: 'Treasurer', responsibilities: 'Oversees funds, investments, budget approvals, financial oversight alongside the accountant.' },
    { society: sid, role: 'Committee Member', responsibilities: 'Represents residents, participates in decision-making, votes on management roles and escalated matters.' },
  ]);

  console.log('Creating meeting attendance + agenda items...');
  const agmMeeting = await Meeting.findOne({ where: { society: sid, title: 'Annual General Meeting' } });
  if (agmMeeting) {
    await MeetingAttendance.bulkCreate([
      { society: sid, meeting: agmMeeting.id, role: 'secretary', flatId: null, user: secretary.id },
      { society: sid, meeting: agmMeeting.id, role: 'chairman', flatId: null, user: chairman.id },
      { society: sid, meeting: agmMeeting.id, role: 'resident', flatId: 'A-101', user: rahul.id },
      { society: sid, meeting: agmMeeting.id, role: 'committee_member', flatId: null, user: committee.id },
    ]);

    await AgendaItem.create({
      society: sid,
      meeting: agmMeeting.id,
      agenda: 'Approve annual maintenance budget for FY 2024-25',
      priority: 'High',
      managementDecision: 'Approved with 8% increase over last year',
      agendaStatus: 'Resolved',
      noOfVotes: 2,
      voters: [chairman.id, secretary.id],
      estimatedStartDate: new Date('2024-06-01'),
      estimatedEndDate: new Date('2025-03-31'),
    });
  }

  console.log('Creating sample committee & management votes...');
  const electionDate = new Date('2024-05-25');
  await CommitteeVote.bulkCreate([
    { society: sid, electionDate, voterFlatId: 'A-101', candidateFlatId: 'A-102' },
    { society: sid, electionDate, voterFlatId: 'B-201', candidateFlatId: 'A-102' },
    { society: sid, electionDate, voterFlatId: 'B-202', candidateFlatId: 'C-301' },
  ]);
  await ManagementVote.bulkCreate([
    { society: sid, electionDate, role: 'Chairman', voterFlatId: 'B-202', candidateFlatId: 'A-101' },
  ]);

  // ---------------------------------------------------------------------
  // Multi-society / multi-role / multi-flat demo account. This one login
  // (multiuser@mysociety.com) belongs to THREE different societies, holds a
  // different role in each, and owns two flats in two of them - exactly the
  // scenario the account switcher (login screen + Topbar "switch account")
  // is built to handle:
  //   Greenfield Residency  -> Committee Member, 2 flats (A-104, A-105)
  //   Palm Heights          -> Secretary,        2 flats (A-101, A-102)
  //   Lake View Apartments  -> Resident/Member,  1 flat  (A-101)
  // ---------------------------------------------------------------------
  console.log('Creating multi-society demo account (account switcher demo)...');
  const multiUser = await User.create({
    name: 'Vikram Mehta',
    email: 'multiuser@mysociety.com',
    password,
    role: 'secretary',
    phone: '9876500098',
  });

  // Society 1: Greenfield Residency (already created above) - Committee Member, 2 flats
  await Membership.bulkCreate([
    { user: multiUser.id, society: sid, role: 'committee_member', flatNo: 'A-104', tower: 'Tower A', flatId: 'A-104' },
    { user: multiUser.id, society: sid, role: 'committee_member', flatNo: 'A-105', tower: 'Tower A', flatId: 'A-105' },
  ]);

  // Society 2: Palm Heights - Secretary, 2 flats
  const palmHeights = await Society.create({
    name: 'Palm Heights',
    slug: 'palm-heights',
    city: 'Pune',
    buildingsCount: 1,
    totalFlats: 10,
    status: 'Active',
  });
  await provisionUnits(palmHeights.id, 1, 10);
  await Membership.bulkCreate([
    { user: multiUser.id, society: palmHeights.id, role: 'secretary', flatNo: 'A-101', tower: 'Tower A', flatId: 'A-101' },
    { user: multiUser.id, society: palmHeights.id, role: 'secretary', flatNo: 'A-102', tower: 'Tower A', flatId: 'A-102' },
  ]);

  // Society 3: Lake View Apartments - Resident (plain member), 1 flat
  const lakeView = await Society.create({
    name: 'Lake View Apartments',
    slug: 'lake-view-apartments',
    city: 'Bengaluru',
    buildingsCount: 1,
    totalFlats: 8,
    status: 'Active',
  });
  await provisionUnits(lakeView.id, 1, 8);
  await Membership.create({
    user: multiUser.id,
    society: lakeView.id,
    role: 'resident',
    flatNo: 'A-101',
    tower: 'Tower A',
    flatId: 'A-101',
  });

  console.log('\n✅ Seed data created successfully!\n');
  console.log(`Demo Society: "${demoSociety.name}"`);
  console.log('Demo login credentials (password for all: 123456):');
  console.log('  Security          -> security@mysociety.com');
  console.log('  Accountant        -> accountant@mysociety.com');
  console.log('  Secretary         -> secretary@mysociety.com');
  console.log('  Chairman (top authority, view-only + Society Structure rights) -> chairman@mysociety.com');
  console.log('  Treasurer         -> treasurer@mysociety.com');
  console.log('  Committee Member  -> committee@mysociety.com');
  console.log('  Housekeeping      -> housekeeping@mysociety.com');
  console.log('  Resident (Owner of A-101 AND D-402, ALSO Secretary) -> rahul@mysociety.com');
  console.log('  Tenant            -> tenant@mysociety.com');
  console.log('  Multi-society (3 societies, 3 roles, 5 flats total)  -> multiuser@mysociety.com');
  console.log('    ^ log in as multiuser or rahul to see the account switcher in action');

  return { society: demoSociety.name };
};

module.exports = runSeed;

// CLI entry point: `npm run seed` - connects to the DB itself and exits when done.
// (When called via the /api/dev/seed route instead, the server is already
// connected, so this block is skipped and only runSeed() above is used.)
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB()
    .then(runSeed)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
