/**
 * Centralized Model Registry.
 *
 * NOTE ON DESIGN: the original MongoDB app queried everything through plain
 * ObjectId fields (society, user, raisedBy, createdBy, owner, resident...)
 * with only a handful of places actually using .populate(). Rather than
 * bolt on a large, mostly-unused Sequelize association graph (which is what
 * the previous "converted" version did, incorrectly, with foreign key names
 * that didn't match any real column), this file just registers every model
 * against the shared `sequelize` instance so sequelize.sync() can create all
 * the tables. The few endpoints that used to call .populate() now do a
 * simple manual lookup instead - see backend/controllers/genericController.js
 * (the `populate` option) and the couple of custom routes that need it.
 */

const { sequelize } = require('../config/db');

// Import all models
const User = require('./User');
const Society = require('./Society');
const Resident = require('./Resident');
const Unit = require('./Unit');
const Building = require('./Building');
const FlatOwner = require('./FlatOwner');
const Pet = require('./Pet');
const Visitor = require('./Visitor');
const Vehicle = require('./Vehicle');
const GatePass = require('./GatePass');
const Shift = require('./Shift');
const Complaint = require('./Complaint');
const Maintenance = require('./Maintenance');
const Notice = require('./Notice');
const Meeting = require('./Meeting');
const MeetingAttendance = require('./MeetingAttendance');
const Poll = require('./Poll');
const CommitteeVote = require('./CommitteeVote');
const ManagementVote = require('./ManagementVote');
const Amenity = require('./Amenity');
const Document = require('./Document');
const Invoice = require('./Invoice');
const Transaction = require('./Transaction');
const Plan = require('./Plan');
const Fund = require('./Fund');
const Investment = require('./Investment');
const Task = require('./Task');
const Supply = require('./Supply');
const Lease = require('./Lease');
const FamilyMember = require('./FamilyMember');
const HomeService = require('./HomeService');
const RoleChecklist = require('./RoleChecklist');
const AgendaItem = require('./AgendaItem');
const CameraRequest = require('./CameraRequest');
const Emergency = require('./Emergency');
const Policy = require('./Policy');
const Membership = require('./Membership');
const Rule = require('./Rule');
const ServiceProviderContact = require('./ServiceProviderContact');
const ParkingAllotment = require('./ParkingAllotment');
const AmenityUsageLog = require('./AmenityUsageLog');
const ActivityLog = require('./ActivityLog');
const InventoryItem = require('./InventoryItem');
const InsurancePolicy = require('./InsurancePolicy');
const Feedback = require('./Feedback');
const SupportTicket = require('./SupportTicket');
const LegalCompliance = require('./LegalCompliance');
const UtilityReading = require('./UtilityReading');
const ConfigList = require('./ConfigList');
const MeetingSettings = require('./MeetingSettings');

// ============================================
// EXPORT ALL MODELS AND SEQUELIZE INSTANCE
// ============================================

module.exports = {
  sequelize,
  User,
  Society,
  Resident,
  Unit,
  Building,
  FlatOwner,
  Pet,
  Visitor,
  Vehicle,
  GatePass,
  Shift,
  Complaint,
  Maintenance,
  Notice,
  Meeting,
  MeetingAttendance,
  Poll,
  CommitteeVote,
  ManagementVote,
  Amenity,
  Document,
  Invoice,
  Transaction,
  Plan,
  Fund,
  Investment,
  Task,
  Supply,
  Lease,
  FamilyMember,
  HomeService,
  RoleChecklist,
  AgendaItem,
  CameraRequest,
  Emergency,
  Policy,
  Membership,
  Rule,
  ServiceProviderContact,
  ParkingAllotment,
  AmenityUsageLog,
  ActivityLog,
  InventoryItem,
  InsurancePolicy,
  Feedback,
  SupportTicket,
  LegalCompliance,
  UtilityReading,
  ConfigList,
  MeetingSettings,
};
