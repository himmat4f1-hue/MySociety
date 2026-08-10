// Run with: npm run seed
// Wipes existing data and inserts demo data matching the Greenfield Residency mockups.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Unit = require('../models/Unit');
const Resident = require('../models/Resident');
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

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Unit.deleteMany(),
    Resident.deleteMany(),
    Visitor.deleteMany(),
    Complaint.deleteMany(),
    Maintenance.deleteMany(),
    Notice.deleteMany(),
    Amenity.deleteMany(),
    Document.deleteMany(),
    Invoice.deleteMany(),
    Transaction.deleteMany(),
    Meeting.deleteMany(),
    Poll.deleteMany(),
    Emergency.deleteMany(),
    CameraRequest.deleteMany(),
    Policy.deleteMany(),
    Investment.deleteMany(),
    Fund.deleteMany(),
    GatePass.deleteMany(),
    Shift.deleteMany(),
    Task.deleteMany(),
    Supply.deleteMany(),
    Lease.deleteMany(),
  ]);

  console.log('Creating users (one per role, password: 123456 for all)...');
  const password = '123456';

  const admin = await User.create({ name: 'Admin User', email: 'admin@mysociety.com', password, role: 'admin' });
  const security = await User.create({ name: 'Ramesh Kumar', email: 'security@mysociety.com', password, role: 'security', phone: '9876500001' });
  const accountant = await User.create({ name: 'Ankit Mehta', email: 'accountant@mysociety.com', password, role: 'accountant', phone: '9876500002' });
  const secretary = await User.create({ name: 'Sunita Iyer', email: 'secretary@mysociety.com', password, role: 'secretary', phone: '9876500003' });
  const chairman = await User.create({ name: 'Rajesh Malhotra', email: 'chairman@mysociety.com', password, role: 'chairman', phone: '9876500004' });

  const treasurer = await User.create({ name: 'Vivek Sharma', email: 'treasurer@mysociety.com', password, role: 'treasurer', phone: '9876500005' });
  const committee = await User.create({ name: 'Anita Kapoor', email: 'committee@mysociety.com', password, role: 'committee_member', phone: '9876500006' });
  const housekeeping = await User.create({ name: 'Suresh Yadav', email: 'housekeeping@mysociety.com', password, role: 'housekeeping', phone: '9876500007' });

  const rahul = await User.create({ name: 'Rahul Sharma', email: 'rahul@mysociety.com', password, role: 'resident', residentType: 'owner', flatNo: 'A-101', tower: 'Tower A', phone: '9876543210' });
  const priya = await User.create({ name: 'Priya Patel', email: 'priya@mysociety.com', password, role: 'resident', residentType: 'owner', flatNo: 'A-102', tower: 'Tower A', phone: '9876543211' });
  const amit = await User.create({ name: 'Amit Verma', email: 'amit@mysociety.com', password, role: 'resident', residentType: 'tenant', flatNo: 'B-201', tower: 'Tower B', phone: '9876543212' });
  const neha = await User.create({ name: 'Neha Singh', email: 'neha@mysociety.com', password, role: 'resident', residentType: 'owner', flatNo: 'B-202', tower: 'Tower B', phone: '9876543213' });
  const vikram = await User.create({ name: 'Vikram Joshi', email: 'vikram@mysociety.com', password, role: 'resident', residentType: 'tenant', flatNo: 'C-301', tower: 'Tower C', phone: '9876543214' });
  const meera = await User.create({ name: 'Meera Nair', email: 'tenant@mysociety.com', password, role: 'tenant', residentType: 'tenant', flatNo: 'D-401', tower: 'Tower D', phone: '9876543217' });

  console.log('Creating units...');
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
  const units = await Unit.insertMany(unitDocs);

  // Link a few known units to our demo residents
  await Unit.updateOne({ flatNo: 'A-101' }, { owner: rahul._id, resident: rahul._id, status: 'Occupied' });
  await Unit.updateOne({ flatNo: 'A-102' }, { owner: priya._id, resident: priya._id, status: 'Occupied' });
  await Unit.updateOne({ flatNo: 'B-201' }, { resident: amit._id, status: 'Occupied' });
  await Unit.updateOne({ flatNo: 'B-202' }, { owner: neha._id, resident: neha._id, status: 'Occupied' });
  await Unit.updateOne({ flatNo: 'C-301' }, { resident: vikram._id, status: 'Occupied' });
  await Unit.updateOne({ flatNo: 'D-401' }, { resident: meera._id, status: 'Occupied' });

  console.log('Creating resident profiles...');
  await Resident.insertMany([
    { user: rahul._id, flatNo: 'A-101', tower: 'Tower A', type: 'Owner', vehicles: [{ type: 'Car', number: 'MH02 AB 1234' }] },
    { user: priya._id, flatNo: 'A-102', tower: 'Tower A', type: 'Owner' },
    { user: amit._id, flatNo: 'B-201', tower: 'Tower B', type: 'Tenant' },
    { user: neha._id, flatNo: 'B-202', tower: 'Tower B', type: 'Owner' },
    { user: vikram._id, flatNo: 'C-301', tower: 'Tower C', type: 'Tenant' },
    { user: meera._id, flatNo: 'D-401', tower: 'Tower D', type: 'Tenant' },
  ]);

  console.log('Creating visitors...');
  await Visitor.insertMany([
    { name: 'Sandeep Kumar', mobile: '9876543210', purpose: 'Personal Visit', flatNo: 'A-101', residentName: 'Rahul Sharma', status: 'Inside' },
    { name: 'Priya Mehta', mobile: '9876543211', purpose: 'Courier Delivery', flatNo: 'A-102', residentName: 'Priya Patel', status: 'Checked Out', outTime: new Date() },
    { name: 'Vijay Singh', mobile: '9876543212', purpose: 'Service Person', flatNo: 'B-201', residentName: 'Amit Verma', status: 'Checked Out', outTime: new Date() },
    { name: 'Rohit Sharma', mobile: '9876543213', purpose: 'Personal Visit', flatNo: 'B-202', residentName: 'Neha Singh', status: 'Inside' },
  ]);

  console.log('Creating complaints...');
  await Complaint.insertMany([
    { title: 'Water Leakage in Bathroom', description: 'Water is leaking from the tap in bathroom.', category: 'Plumbing', priority: 'High', status: 'Open', flatNo: 'A-101', raisedBy: rahul._id },
    { title: 'Lift Not Working', description: 'Lift of Tower A is not working since morning.', category: 'Lift', priority: 'High', status: 'In Progress', flatNo: 'A-102', raisedBy: priya._id },
    { title: 'Street Light Not Working', description: 'Street light near gate is not working.', category: 'Electrical', priority: 'Medium', status: 'In Progress', flatNo: 'B-201', raisedBy: amit._id },
    { title: 'Garbage Not Collected', description: 'Garbage not collected from our floor.', category: 'Housekeeping', priority: 'Low', status: 'Resolved', flatNo: 'B-202', raisedBy: neha._id, resolvedOn: new Date() },
  ]);

  console.log('Creating maintenance requests...');
  await Maintenance.insertMany([
    { title: 'Water Leakage in Bathroom', description: 'Water is leaking from the tap.', category: 'Plumbing', priority: 'High', status: 'Open', flatNo: 'A-101', raisedBy: rahul._id },
    { title: 'Lift Not Working', description: 'Lift is not working since morning.', category: 'Lift', priority: 'High', status: 'In Progress', flatNo: 'A-102', raisedBy: priya._id },
    { title: 'AC Outdoor Unit Noise', description: 'AC is making a loud noise.', category: 'AC/HVAC', priority: 'Low', status: 'Completed', flatNo: 'B-202', raisedBy: neha._id, completedOn: new Date() },
  ]);

  console.log('Creating notices...');
  await Notice.insertMany([
    { title: 'Annual Maintenance Charges Due', description: 'This is a reminder that annual maintenance charges for FY 2024-25 are due by 31st May 2024.', category: 'Finance', status: 'Published', createdBy: secretary._id },
    { title: 'Water Supply Interruption', description: 'Water supply will be unavailable on Sunday from 10:00 PM to 6:00 AM due to pipeline maintenance.', category: 'Maintenance', building: 'Tower A, Tower B', status: 'Published', createdBy: secretary._id },
    { title: 'Community Meeting', description: 'All residents are requested to attend the community meeting on 18th May 2024 at 6:00 PM in the clubhouse.', category: 'Community', status: 'Published', createdBy: secretary._id },
    { title: 'New Parking Rules', description: 'Please follow the updated parking guidelines effective from 20th May 2024.', category: 'Rules & Regulations', status: 'Scheduled', scheduledDate: new Date(Date.now() + 7 * 86400000), createdBy: secretary._id },
  ]);

  console.log('Creating amenities...');
  await Amenity.insertMany([
    { name: 'Gym', type: 'Fitness', building: 'Tower A', status: 'Available', availability: '6:00 AM - 10:00 PM' },
    { name: 'Swimming Pool', type: 'Recreation', building: 'Tower B', status: 'Available', availability: '7:00 AM - 9:00 PM' },
    { name: 'Club House', type: 'Community', building: 'All Towers', status: 'Available', availability: '8:00 AM - 11:00 PM' },
    { name: 'Tennis Court', type: 'Sports', building: 'Tower C', status: 'Under Maintenance' },
    { name: 'Children Play Area', type: 'Recreation', building: 'Tower A', status: 'Available', availability: '6:00 AM - 9:00 PM' },
    { name: 'Power Backup', type: 'Utility', building: 'All Towers', status: 'Out of Service' },
  ]);

  console.log('Creating documents...');
  await Document.insertMany([
    { name: 'Society By-Laws', category: 'Governance', type: 'Folder', isFolder: true },
    { name: 'Annual Budget 2024-25.pdf', category: 'Finance', type: 'PDF', sizeKB: 2400 },
    { name: 'Maintenance Charges.xlsx', category: 'Finance', type: 'Excel', sizeKB: 1100 },
    { name: 'General Meeting Minutes.docx', category: 'Governance', type: 'Word', sizeKB: 850, isFavorite: true },
    { name: 'Fire Safety Guidelines.pdf', category: 'Safety', type: 'PDF', sizeKB: 1800 },
  ]);

  console.log('Creating invoices...');
  await Invoice.insertMany([
    { invoiceNo: 'INV-2024-05-001', flatNo: 'A-1303', residentName: 'Neha Singh', amount: 5250, dueDate: new Date('2024-05-20'), status: 'Paid' },
    { invoiceNo: 'INV-2024-05-102', flatNo: 'B-402', residentName: 'Amit Verma', amount: 5250, dueDate: new Date('2024-05-18'), status: 'Pending' },
    { invoiceNo: 'INV-2024-05-103', flatNo: 'C-1101', residentName: 'Vikram Joshi', amount: 5200, dueDate: new Date('2024-05-10'), status: 'Overdue' },
    { invoiceNo: 'INV-2024-06-104', flatNo: 'A-101', residentName: 'Rahul Sharma', amount: 5250, dueDate: new Date('2024-06-20'), status: 'Pending' },
    { invoiceNo: 'INV-2024-06-105', flatNo: 'D-401', residentName: 'Meera Nair', amount: 4800, dueDate: new Date('2024-06-15'), status: 'Pending' },
  ]);

  console.log('Creating transactions...');
  await Transaction.insertMany([
    { type: 'Income', category: 'Maintenance', description: 'Maintenance Bill - May', amount: 5250, flatNo: 'A-101', status: 'Collected' },
    { type: 'Expense', category: 'Utilities', description: 'Electricity Bill Payment', amount: 18600, flatNo: 'B-201', status: 'Paid' },
    { type: 'Income', category: 'Maintenance', description: 'Water Bill Collection', amount: 12000, flatNo: 'C-301', status: 'Collected' },
    { type: 'Expense', category: 'Others', description: 'Gardening Expense', amount: 4500, status: 'Paid' },
  ]);

  console.log('Creating meetings...');
  await Meeting.insertMany([
    { title: 'Annual General Meeting', type: 'General', date: new Date('2024-05-25T10:00:00'), location: 'Conference Room', agenda: 'Financial approval and by-law amendment discussion', createdBy: secretary._id },
    { title: 'Executive Committee Meeting', type: 'Committee', date: new Date('2024-05-20T17:00:00'), location: 'Committee Room', createdBy: secretary._id },
    { title: 'Building Maintenance Meeting', type: 'Internal', date: new Date('2024-05-30T18:00:00'), location: 'Tower A Meeting Room', createdBy: secretary._id },
  ]);

  console.log('Creating polls...');
  await Poll.insertMany([
    { title: 'By-Law Amendment', description: 'Proposed changes to society by-laws', endDate: new Date(Date.now() + 14 * 86400000), votesYes: 45, votesNo: 8, totalEligible: 60, createdBy: chairman._id },
    { title: 'Parking Rules Amendment', description: 'New guidelines for visitor parking', endDate: new Date(Date.now() + 3 * 86400000), votesYes: 30, votesNo: 12, totalEligible: 60, createdBy: chairman._id },
  ]);

  console.log('Creating emergencies, camera requests, policies, investments, funds...');
  await Emergency.create({ type: 'Security', flatNo: 'A-101', raisedBy: rahul._id, notes: 'Unauthorized vehicle spotted', status: 'Resolved' });

  await CameraRequest.create({ area: 'Main Gate', date: new Date('2024-05-17'), time: '08:30', reason: 'Bike scratch incident in parking.', flatNo: 'A-101', requestedBy: rahul._id, status: 'Pending' });

  await Policy.insertMany([
    { title: 'Visitor Management Policy', version: '2.1', publishedOn: new Date('2024-01-12') },
    { title: 'Parking Policy', version: '1.3', publishedOn: new Date('2023-10-05') },
    { title: 'Maintenance Policy', version: '2.0', publishedOn: new Date('2023-01-01') },
    { title: 'Pet Policy', version: '1.1', publishedOn: new Date('2023-03-10') },
  ]);

  await Investment.insertMany([
    { kind: 'Investment', name: 'Fixed Deposit - HDFC', amount: 250000, maturityDate: new Date('2024-12-15') },
    { kind: 'Investment', name: 'Fixed Deposit - ICICI', amount: 150000, maturityDate: new Date('2024-08-10') },
    { kind: 'Investment', name: 'Mutual Fund - SBI', amount: 100000 },
  ]);

  await Fund.insertMany([
    { type: 'Required', title: 'Lift Modernization Project', targetAmount: 1200000, collectedAmount: 600000, dueDate: new Date('2024-06-30') },
    { type: 'Required', title: 'Painting Work - Phase 2', targetAmount: 650000, collectedAmount: 200000, dueDate: new Date('2024-07-15') },
    { type: 'Celebration', title: 'Diwali Celebration 2024', collectedAmount: 150000, expenseAmount: 120000 },
  ]);

  console.log('Creating gate passes, shifts, tasks, supplies, leases...');

  await GatePass.insertMany([
    { type: 'Vendor', name: 'Swiggy Delivery', mobile: '9998887771', flatNo: 'A-101', validTill: new Date(Date.now() + 2 * 3600000), status: 'Active' },
    { type: 'Vehicle', name: 'Amit Verma Car', vehicleNumber: 'MH02 CD 5678', flatNo: 'B-201', validTill: new Date(Date.now() + 30 * 86400000), status: 'Active' },
    { type: 'Service Staff', name: 'Ramesh (Plumber)', mobile: '9998887772', flatNo: 'C-301', validTill: new Date(Date.now() - 86400000), status: 'Expired' },
  ]);

  await Shift.insertMany([
    { staffName: 'Ramesh Kumar', role: 'Security', shiftType: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM', status: 'Present' },
    { staffName: 'Suresh Yadav', role: 'Housekeeping', shiftType: 'Morning', startTime: '07:00 AM', endTime: '03:00 PM', status: 'Present' },
    { staffName: 'Night Guard', role: 'Security', shiftType: 'Night', startTime: '10:00 PM', endTime: '06:00 AM', status: 'Scheduled' },
  ]);

  await Task.insertMany([
    { title: 'Sweep & Mop Main Lobby', area: 'Main Lobby', assignedTo: 'Suresh Yadav', frequency: 'Daily', priority: 'High', status: 'Completed' },
    { title: 'Clean Club House Windows', area: 'Club House', assignedTo: 'Suresh Yadav', frequency: 'Weekly', priority: 'Medium', status: 'Pending' },
    { title: 'Garden Trimming', area: 'Garden', assignedTo: 'Suresh Yadav', frequency: 'Weekly', priority: 'Low', status: 'In Progress' },
    { title: 'Garbage Collection - Tower A', area: 'Tower A', assignedTo: 'Suresh Yadav', frequency: 'Daily', priority: 'High', status: 'Pending' },
  ]);

  await Supply.insertMany([
    { itemName: 'Floor Cleaner', category: 'Cleaning', quantity: 12, unit: 'bottles', status: 'In Stock' },
    { itemName: 'Garbage Bags', category: 'Cleaning', quantity: 5, unit: 'packs', status: 'Low Stock' },
    { itemName: 'Hand Gloves', category: 'Safety', quantity: 0, unit: 'boxes', status: 'Out of Stock' },
    { itemName: 'Mop Set', category: 'Equipment', quantity: 8, unit: 'pcs', status: 'In Stock' },
  ]);

  await Lease.insertMany([
    { flatNo: 'B-201', tower: 'Tower B', tenantName: 'Amit Verma', ownerName: 'Owner (B-201)', leaseStart: new Date('2024-01-01'), leaseEnd: new Date('2024-12-31'), monthlyRent: 25000, securityDeposit: 75000, status: 'Active' },
    { flatNo: 'C-301', tower: 'Tower C', tenantName: 'Vikram Joshi', ownerName: 'Owner (C-301)', leaseStart: new Date('2023-09-01'), leaseEnd: new Date('2024-08-31'), monthlyRent: 22000, securityDeposit: 66000, status: 'Expiring Soon' },
    { flatNo: 'D-401', tower: 'Tower D', tenantName: 'Meera Nair', ownerName: 'Owner (D-401)', leaseStart: new Date('2024-03-01'), leaseEnd: new Date('2025-02-28'), monthlyRent: 20000, securityDeposit: 60000, status: 'Active' },
  ]);

  console.log('\n✅ Seed data created successfully!\n');
  console.log('Demo login credentials (password for all: 123456):');
  console.log('  Admin             -> admin@mysociety.com');
  console.log('  Security          -> security@mysociety.com');
  console.log('  Accountant        -> accountant@mysociety.com');
  console.log('  Secretary         -> secretary@mysociety.com');
  console.log('  Chairman          -> chairman@mysociety.com');
  console.log('  Treasurer         -> treasurer@mysociety.com');
  console.log('  Committee Member  -> committee@mysociety.com');
  console.log('  Housekeeping      -> housekeeping@mysociety.com');
  console.log('  Resident (Owner)  -> rahul@mysociety.com');
  console.log('  Tenant            -> tenant@mysociety.com');

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
